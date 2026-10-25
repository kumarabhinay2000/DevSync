# DevSync AI

AI-assisted repository understanding, code analysis and controlled change review.

## Documentation handoff

The repository contains a complete target documentation baseline: product requirements, architecture, UX, data, APIs/events/tools, security, delivery, evaluation and operations. Application services are not implemented yet; no deployed system or passing application tests are claimed.

- [Complete documentation index](docs/README.md)
- [Completion matrix and implementation boundary](docs/17-documentation-status.md)
- [Selected defaults and limits](docs/18-baseline-decisions-and-limits.md)
- [Machine-readable contracts](contracts/README.md)
- [Validation evidence](docs/reference/validation-report.md)

## Validate documentation

Use the [configuration/toolchain guide](docs/27-configuration-and-toolchain.md) to install the pinned documentation validators and run `python scripts/validate_documentation.py`. Validation never applies database DDL or deploys services.

## Delivery direction

Implement an authenticated GitHub repository → immutable index → grounded AI answer with citations vertical slice first. Preserve existing product functionality when application code is introduced. All requested technologies have explicit target roles and delivery phases; optional providers are adapters rather than duplicated sources of truth.
