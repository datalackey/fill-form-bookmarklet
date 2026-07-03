Shared foundation layer used by both phases: the TypeScript interfaces (FormField, Template, MatchResult, ScanViewModel), the DOM utility code (field discovery by name attribute, four-pattern label detection, and group clustering, ported from the spike), and the clipboard transport (read/parse/serialize the JSON template).

## Files

### `types.ts`

All shared interfaces. No runtime code, no imports.

| Type            | Kind      | Description                                                                                                                            |
| --------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `LabelResult`   | interface | `{ text: string; pattern: number \| string }` — the detected label text and which pattern found it (0 = none, 1–3/3b = pattern number) |
| `FormField`     | interface | One discovered form control: `name`, `label`, `labelPattern`, `value`, `element`, `groupLabel` (null when not part of a cluster)       |
| `Template`      | interface | Flat `{ [name: string]: string }` map — the user's saved template                                                                      |
| `MatchResult`   | interface | Three-way fill match: `willFill`, `noMatchOnPage` (stale keys), `noValueInTemplate`                                                    |
| `ScanViewModel` | interface | Scan output: `fields`, `template`, `templateText` (serialized JSON ready to copy)                                                      |

### `dom.ts`

Field discovery and label detection, ported from the spike and validated against the test server.

| Export           | Signature                              | Description                                                                                                                                                                          |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `detectLabel`    | `(el: HTMLElement) => LabelResult`     | Tries four patterns in priority order (see below); returns `{ text: "", pattern: 0 }` when none match                                                                                |
| `discoverFields` | `() => FormField[]`                    | Queries all `input, select, textarea` elements, filters to those with a non-empty `name` attribute (excluding submit/button inputs), runs label detection, then calls `detectGroups` |
| `detectGroups`   | `(fields: FormField[]) => FormField[]` | Sets `groupLabel` to the shared label text on any fields whose detected label is shared by two or more fields (date/time cluster pattern); singletons get `null`                     |

Label detection patterns (tried in order):

1. `<label for="el.id">` — formal HTML association
2. Field is a descendant of a `<label>` — wrapping label
3. Nearest preceding sibling `<label>` — heuristic
4. `3b`: parent container's nearest preceding sibling is a `<label>` — CalendarWiz div-wrapper style

Known carry-forward issues from the spike: radio buttons report individual option label text rather than the shared group label; label `textContent` includes child `<span>` annotation text.

### `clipboard.ts`

Clipboard transport. All I/O is isolated here so the rest of the codebase is pure and testable.

| Export              | Signature                           | Description                                                                                                                                               |
| ------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `readClipboard`     | `() => Promise<string>`             | Reads clipboard text via `navigator.clipboard.readText()`; returns `""` when the API is unavailable or permission is denied (triggers Scan mode fallback) |
| `parseTemplate`     | `(raw: string) => Template \| null` | Parses `raw` as JSON; returns `null` for empty strings, non-objects, or invalid JSON (null = not a template = Scan mode)                                  |
| `serializeTemplate` | `(template: Template) => string`    | `JSON.stringify` with 2-space indent — the text the user saves to their template file                                                                     |
