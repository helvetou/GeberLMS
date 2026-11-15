# SBOM — Milestone m4 (v0.4.0)

Software Bill of Materials of milestone **m4** — GeberLMS v0.4.0.

## Metadata

- **Milestone**: m4
- **Version**: 0.4.0
- **Tag**: v0.4.0 (to set at delivery)
- **Date**: —
- **Status**: planned

## Inherited base

The reference SBOM is m1's: [`../m1/SBOM.md`](../m1/SBOM.md).
This milestone inherits that base and adds or modifies the components below.

## Anticipated components (to confirm at delivery)

- **Routes**: /catalog (list) + /catalog/[slug] (detail)
- **UI components**: course-card, catalog-search, catalog-filters, course-detail
- **Dependencies**: none new (reuses shadcn-svelte)
- **Notes**: 0006 fields, public visibility

## To fill in at delivery

Record the exact dependency versions, list the new first-party modules
(`src/lib/domain`, `src/lib/server`, `src/lib/components`) and re-verify the whole SBOM after implementation.
