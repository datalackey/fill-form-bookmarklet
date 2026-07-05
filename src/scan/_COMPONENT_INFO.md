Scan-mode logic: builds a name→value template from discovered fields and produces the view model for the overlay.

## Files

### `scan.ts`

| Export               | Signature                           | Description                                                                                                                                              |
| -------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buildTemplate`      | `(fields: FormField[]) => Template` | Reduces a field list to a flat `{ name: value }` map — the shape the user saves and later edits                                                          |
| `buildScanViewModel` | `() => ScanViewModel`               | Calls `discoverFields()`, builds the template from the results, serializes it to JSON, and returns the complete `ScanViewModel` that the overlay renders |

## Data flow

```
discoverFields()  →  fields: FormField[]
buildTemplate()   →  template: Template
serializeTemplate()  →  templateText: string  (pretty-printed JSON)
```

All three are bundled into the `ScanViewModel` returned to the orchestrator.
