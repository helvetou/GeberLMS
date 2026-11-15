# SBOM — Milestone m7 (v0.7.0)

Software Bill of Materials of milestone **m7** — GeberLMS v0.7.0.

## Metadata

- **Milestone**: m7
- **Version**: 0.7.0
- **Tag**: v0.7.0 (to set at delivery)
- **Date**: —
- **Status**: planned

## Inherited base

The reference SBOM is m1's: [`../m1/SBOM.md`](../m1/SBOM.md).
This milestone inherits that base and adds or modifies the components below.

## Anticipated components (to confirm at delivery)

- **Routes**: — (admin forms)
- **UI components**: forms (reuse m3)
- **Dependencies**: reuse m3 (formsnap/superforms/zod)
- **Notes**: coupon toggle (fix audit §7.2), OSS accounting validation

## To fill in at delivery

Record the exact dependency versions, list the new first-party modules
(`src/lib/domain`, `src/lib/server`, `src/lib/components`) and re-verify the whole SBOM after implementation.
