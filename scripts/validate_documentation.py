"""Validate all documentation artifacts without applying SQL or starting services.

Run from any directory with the dependencies in requirements-docs.txt installed.
Generated report/inventory files are excluded from their own content hashes.
"""
from __future__ import annotations

import copy
import hashlib
import importlib.metadata
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET

from jsonschema import Draft202012Validator, FormatChecker
from openapi_spec_validator import validate_spec
from pglast import parse_sql
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "docs/reference"
GENERATED = {
    "docs/reference/validation-report.json",
    "docs/reference/validation-report.md",
    "docs/reference/file-inventory.json",
}


def files() -> list[Path]:
    """Inspect documentation/source artifacts, never dependencies or secret files."""
    result = []
    for base in (ROOT / "docs", ROOT / "contracts", ROOT / "scripts"):
        for path in base.rglob("*"):
            if path.is_file() and not any(
                part in {"__pycache__", ".venv-docs"} for part in path.parts
            ):
                result.append(path)
    result.extend([ROOT / "README.md", ROOT / ".gitignore"])
    return sorted(set(result))


def main() -> None:
    artifact_files = files()
    checks: dict[str, object] = {}
    link_count = 0
    markdown = [p for p in artifact_files if p.suffix == ".md"]
    for path in markdown:
        text = path.read_text(encoding="utf-8")
        assert len(re.findall(r"^```", text, re.M)) % 2 == 0, f"Fence: {path}"
        assert not re.search(r"^\s*(?:TODO|TBD|FIXME)\s*[:=-]", text, re.M), path
        for target in re.findall(r"\]\(([^)]+)\)", text):
            if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target):
                continue
            target_path = (path.parent / target.split("#")[0]).resolve()
            # Reports are produced by this run after all other checks succeed.
            if target_path.as_posix().removeprefix(ROOT.as_posix() + "/") in GENERATED:
                continue
            assert target_path.exists(), f"Broken link: {path.name}: {target}"
            link_count += 1
    checks["markdown"] = {"files": len(markdown), "localLinks": link_count,
                          "fencesAndExplicitPlaceholders": "passed"}

    json_files = [p for p in artifact_files if p.suffix == ".json"
                  and p.relative_to(ROOT).as_posix() not in GENERATED]
    for path in json_files:
        json.loads(path.read_text(encoding="utf-8"))
    api = json.loads((ROOT / "contracts/openapi.json").read_text(encoding="utf-8"))
    validate_spec(api)
    operation_ids = []
    for path, item in api["paths"].items():
        expected = set(re.findall(r"\{([^}]+)\}", path))
        actual = {p["name"] for p in item.get("parameters", []) if p["in"] == "path"}
        assert expected == actual, path
        for method, operation in item.items():
            if method == "parameters":
                continue
            operation_ids.append(operation["operationId"])
            assert operation["x-delivery-phase"] in {"mvp", "automation"}
            if path != "/integrations/github/webhooks":
                assert operation.get("security", api["security"]), path
    assert len(operation_ids) == len(set(operation_ids))
    checks["openapi"] = {"version": api["info"]["version"],
                         "operations": len(operation_ids), "result": "passed"}

    schema_files = sorted((ROOT / "contracts").rglob("*.schema.json"))
    schemas = [json.loads(p.read_text(encoding="utf-8")) for p in schema_files]
    registry = Registry().with_resources(
        (s["$id"], Resource.from_contents(s)) for s in schemas
    )
    for schema in schemas:
        Draft202012Validator.check_schema(schema)
    example_count = 0
    negative_count = 0
    for path in sorted((ROOT / "contracts/examples").glob("*.json")):
        name = path.stem
        schema = json.loads((ROOT / f"contracts/events/{name}.v1.schema.json")
                            .read_text(encoding="utf-8"))
        validator = Draft202012Validator(schema, registry=registry,
                                        format_checker=FormatChecker())
        example = json.loads(path.read_text(encoding="utf-8"))
        validator.validate(example)
        example_count += 1
        invalid = copy.deepcopy(example)
        invalid["eventId"] = "not-a-uuid"
        assert list(validator.iter_errors(invalid)), path
        negative_count += 1
        invalid = dict(example, forbiddenCredential="synthetic-secret")
        assert list(validator.iter_errors(invalid)), path
        negative_count += 1
    # Negative argument cases: model cannot inject scope or arbitrary commands.
    for path in sorted((ROOT / "contracts/tools").glob("*.input.schema.json")):
        validator = Draft202012Validator(json.loads(path.read_text(encoding="utf-8")),
                                        registry=registry)
        assert list(validator.iter_errors({"workspaceId": "forged", "command": "arbitrary"}))
        negative_count += 1
    checks["jsonSchemas"] = {"schemas": len(schemas), "positiveExamples": example_count,
                              "negativeCases": negative_count, "result": "passed"}
    checks["jsonParsing"] = {"files": len(json_files), "result": "passed"}

    proto = ROOT / "contracts/proto"
    with tempfile.TemporaryDirectory(prefix="devsync-proto-") as output:
        completed = subprocess.run(
            [sys.executable, "-m", "grpc_tools.protoc", f"-I{proto}",
             f"--descriptor_set_out={Path(output) / 'contracts.pb'}", "--include_imports",
             "devsync/ai/v1/ai.proto"], cwd=proto, capture_output=True, text=True,
        )
        assert completed.returncode == 0, completed.stderr
        from google.protobuf.descriptor_pb2 import FileDescriptorSet
        descriptor = FileDescriptorSet()
        descriptor.ParseFromString((Path(output) / "contracts.pb").read_bytes())
        checks["protobuf"] = {
            "files": len(descriptor.file),
            "services": sum(len(f.service) for f in descriptor.file),
            "methods": sum(len(s.method) for f in descriptor.file for s in f.service),
            "result": "compiled",
        }

    sql = (REFERENCE / "schema.sql").read_text(encoding="utf-8")
    statements = parse_sql(sql)
    table_names = re.findall(r"CREATE TABLE\s+(\w+)", sql, re.I)
    assert len(table_names) == len(set(table_names))
    checks["sql"] = {"statements": len(statements), "tables": len(table_names),
                     "result": "syntax parsed; not applied to PostgreSQL"}
    svgs = sorted((ROOT / "docs/wireframes").glob("*.svg"))
    for path in svgs:
        svg = ET.parse(path).getroot()
        assert svg.tag.endswith("svg")
        assert svg.find("{http://www.w3.org/2000/svg}title") is not None
    checks["wireframes"] = {"svgFiles": len(svgs), "result": "XML parsed"}

    inventory = []
    for path in artifact_files:
        rel = path.relative_to(ROOT).as_posix()
        if rel in GENERATED:
            continue
        inventory.append({"path": rel, "bytes": path.stat().st_size,
                          "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    versions = {n: importlib.metadata.version(n) for n in (
        "openapi-spec-validator", "jsonschema", "grpcio-tools", "pglast"
    )}
    report = {"result": "passed", "documentationBaselineDate": "2026-10-25",
              "python": sys.version.split()[0], "validatorVersions": versions,
              "checks": checks, "inventoriedFiles": len(inventory),
              "limitations": ["No application implementation/tests were executed.",
                              "SQL was parsed, not migrated against PostgreSQL/pgvector.",
                              "SVG layout is static; browser/a11y verification is not claimed.",
                              "No cluster, provider contract, backup restore or production system was verified."]}
    REFERENCE.mkdir(exist_ok=True)
    (REFERENCE / "file-inventory.json").write_text(json.dumps(inventory, indent=2) + "\n",
                                                  encoding="utf-8")
    (REFERENCE / "validation-report.json").write_text(json.dumps(report, indent=2) + "\n",
                                                     encoding="utf-8")
    lines = ["# Documentation Validation Report", "",
             "Baseline date: 25 October 2026. Result: **PASS**.", "",
             "Generated by scripts/validate_documentation.py; rerun after any source changes.", "",
             "| Check | Recorded result |", "|---|---|"]
    for key, value in checks.items():
        lines.append(f"| {key} | {json.dumps(value)} |")
    lines += ["", f"Inventory: {len(inventory)} source artifacts with SHA-256 hashes.", "",
              "## Scope limits", ""]
    lines += [f"- {item}" for item in report["limitations"]]
    (REFERENCE / "validation-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"result": "passed", "checks": checks,
                      "inventoriedFiles": len(inventory)}, indent=2))


if __name__ == "__main__":
    main()
