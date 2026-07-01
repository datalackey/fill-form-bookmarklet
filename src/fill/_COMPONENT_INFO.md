Fill-mode logic: three-way match between a template and the page form, single-field value application with input/change events, and the clipboard-driven fill entry point.

## Files

### `fill.ts`

| Export | Signature | Description |
|--------|-----------|-------------|
| `matchFields` | `(template: Template, fields: FormField[]) => MatchResult` | Partitions discovered fields into three buckets: `willFill` (template has a value for the field's `name`), `noValueInTemplate` (field has no template entry), and `noMatchOnPage` (template key with no field on the page — stale) |
| `fillField` | `(field: FormField, value: string) => void` | Sets `element.value`, then dispatches `input` and `change` events with `bubbles: true` so framework listeners fire. TODO: checkbox (`checked`) and `<select>` (`selectedIndex`) handling per CLAUDE.md |
| `runFill` | `() => Promise<MatchResult \| null>` | Entry point: reads clipboard, parses template. Returns `null` when no template is present (orchestrator falls back to Scan). When a template is found, discovers page fields and returns the three-way match |

## Constraints

- Hidden fields discovered by `discoverFields()` are included in the match but **must never be overwritten**; the caller (overlay) is responsible for omitting them from the fill action.
- Fill only ever runs on `willFill` fields — the user confirms via overlay before any field is touched.
