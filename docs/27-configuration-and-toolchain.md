# Configuration, Toolchain, and Setup Handoff

## Runtime targets

Implementation targets Java 21 with Maven Wrapper, Node.js 22 (at least 22.12 for the frontend build baseline) with npm lockfile, and Python 3.12 with an exact dependency lock. PostgreSQL 16 plus pgvector is the reference database target. These are deliberate target families, not claims that all libraries have been installed, support-purchased, or integration-tested.

Spring Boot 3.5's documented Java range includes Java 21. Vite's guide documents the Node 22.12+ threshold. FastAPI's project metadata requires Python ≥3.10, so Python 3.12 meets the language floor. Pin exact patch/library/image versions after a clean compatibility build and scan; do not mistake this language-floor check for complete dependency validation. Sources: [Spring Boot system requirements](https://docs.spring.io/spring-boot/3.5/system-requirements.html), [Vite guide](https://vite.dev/guide/), [FastAPI project metadata](https://github.com/fastapi/fastapi/blob/master/pyproject.toml).

## Required source-controlled toolchain files

Frontend: package.json, package-lock.json, TypeScript configuration, lint configuration, Vite configuration, RTL/Playwright setup. Backend: pom.xml, Maven wrapper/checksums, Java compiler release, Flyway migrations, JUnit/Mockito configuration. Python: pyproject.toml, exact dependency lock, type/lint/test configuration, generated protobuf package rules. Infrastructure: pinned image digests, Compose/config schema, Kubernetes environment overlays. None is implied to exist by this documentation.

Documentation validation dependencies are separately pinned in [requirements](../scripts/requirements-docs.txt). They do not determine application dependency versions.

## Configuration reference

[environment.example](reference/environment.example) is a non-secret reference, not an active .env. Empty provider credentials/model IDs are required deployment inputs and disable live provider operations. The local synthetic/provider-double workflow does not require private source or purchased services.

Fail startup for malformed mandatory service configuration. Fail the affected feature closed for intentionally disabled optional integrations; report a clear capability state without restarting healthy unrelated services. Validate database/vector dimensions, OIDC issuer/audience, allowed origins, internal TLS identity, provider policy and pricing before enabling the relevant capability.

## Working documentation-validation commands

From the project root in PowerShell:

```powershell
python -m venv .venv-docs
& .\.venv-docs\Scripts\python.exe -m pip install -r scripts/requirements-docs.txt
& .\.venv-docs\Scripts\python.exe scripts/validate_documentation.py
```

The validator checks every tracked documentation/contract reference file, OpenAPI, JSON Schemas/examples, protobuf compilation, SQL syntax and SVG XML. It writes a report under docs/reference. It does not launch services, apply SQL or contact private data processors.

## Application first-run acceptance procedure

1. Create the service/build manifests from the target structure and pin dependency versions.
2. Copy the reference configuration to an untracked local environment file and set real local endpoints/credentials.
3. Start PostgreSQL/pgvector, Redis, Kafka and local Keycloak using the implemented Compose definition; verify readiness.
4. Run Flyway migration job and create a synthetic workspace/test users using a development-only seed tool.
5. Start API, private AI/gRPC service, worker and frontend with their implemented wrappers.
6. Sign in, connect a test GitHub installation, index a fixed public fixture commit, and run the reference Q&A workflow.
7. Run unit, integration, accessibility, contract, isolation and evaluation suites; record results.
8. Stop services gracefully; verify persisted data survives restart. Use a separate explicitly destructive reset procedure only for disposable environments.

Commands for these application steps must come from actual manifests and be exercised before they are called verified setup instructions. Creating imaginary `docker compose up` or Maven commands for absent files would not complete the project.
