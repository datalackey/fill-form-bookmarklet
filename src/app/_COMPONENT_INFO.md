Application shell: the thin orchestration entry point that auto-detects mode from the clipboard (Fill when a valid template is present, otherwise Scan), the React/iframe page-compatibility guards, and the in-page overlay UI that renders the Scan table and Fill summary.

## Files

### `detect.ts`

Page-compatibility guards. Both are pure boolean checks with no side effects.

| Export | Signature | Description |
|--------|-----------|-------------|
| `isReactForm` | `() => boolean` | Returns `true` if any of three React signals are present: `[data-reactroot]` element, `window.__REACT_DEVTOOLS_GLOBAL_HOOK__`, or `__reactFiber`/`__reactInternalInstance` keys on the form element |
| `isInsideIframe` | `() => boolean` | Returns `true` when `window.self !== window.top`; catches the cross-origin `SecurityError` and treats it as `true` |

### `index.ts`

Entry point (esbuild target). Runs `isReactForm()` and `isInsideIframe()` first; either failure shows an `alert` and exits. Otherwise attempts `runFill()` — if a template is on the clipboard it renders the Fill view, otherwise falls back to `buildScanViewModel()` and renders the Scan view.

### `overlay.ts`

In-page overlay injected at `z-index: 2147483647` (max safe integer).

| Export | Signature | Description |
|--------|-----------|-------------|
| `showOverlay` | `(html: string) => void` | Closes any existing overlay, creates a fixed-position `div#ffb-overlay`, sets `innerHTML`, appends to `document.body` |
| `closeOverlay` | `() => void` | Removes `#ffb-overlay` if present |
| `renderScanView` | `(model: ScanViewModel) => string` | Builds the Scan table HTML (name / label / value / group columns) and the `<pre>` template block |
| `renderFillView` | `(result: MatchResult) => string` | Builds the Fill summary HTML (will-fill count, stale keys, unmatched fields) |
