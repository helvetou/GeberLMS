# SBOM — Milestone m3 (v0.3.0)

Software Bill of Materials of milestone **m3** — GeberLMS v0.3.0.

## Metadata

- **Milestone**: m3
- **Version**: 0.3.0
- **Tag**: v0.3.0 (to set at delivery)
- **Date**: —
- **Status**: planned

## Inherited base

The reference SBOM is m1's: [`../m1/SBOM.md`](../m1/SBOM.md).
This milestone inherits that base and adds or modifies the components below.

## Anticipated components (to confirm at delivery)

- **Routes**: — (admin content)
- **UI components**: form, data-table
- **Dependencies**: formsnap, sveltekit-superforms, zod
- **Notes**: JSON import (upsert, reconciliation key), module/lesson reordering

## To fill in at delivery

Record the exact dependency versions, list the new first-party modules
(`src/lib/domain`, `src/lib/server`, `src/lib/components`) and re-verify the whole SBOM after implementation.
