# CLAUDE.md — form-fill-bookmarklet

## What this project is

A browser bookmarklet that helps non-technical users fill out and submit
HTML forms repeatedly from a JSON template stored in a plain text file.
Primary use case: activist/nonprofit orgs submitting events to web-based
calendar systems (e.g. CalendarWiz at sanjosepeace.org/calendar).

The bookmarklet has no dependencies, requires no installation beyond
saving a browser bookmark, and is designed for users who are comfortable
editing a text file but not writing code.

---

## Repository

`git@github.com:datalackey/form-fill-bookmarklet.git`

Related repos:
- `git@github.com:datalackey/build-tools.git` — monorepo of tooling packages
- `git@github.com:datalackey/typescript-build-config.git` — shared ESLint/Prettier/tsconfig base

---

## How the bookmarklet works

Single bookmarklet, two modes, auto-detected via clipboard content:

### SCAN MODE
Triggered when clipboard is empty, unreadable, or not valid JSON.

1. Check for React (see React detection below) — if detected, show error and stop
2. Discover all form fields that have a `name` attribute
3. For each field, detect its human-readable label (three patterns, see below)
4. Detect grouped fields (date/time clusters sharing a label)
5. Display overlay with:
   - Two-column table: field name | label | current value
   - Grouped fields visually clustered under shared label
   - Formatted JSON template (plain `name → value`, no label annotations)
   - "Copy JSON to Clipboard" button
   - Instructions to save JSON to a text file

### FILL MODE
Triggered when clipboard contains valid JSON.

1. Parse clipboard JSON as `name → value` map
2. Discover all form fields with `name` attribute
3. Three-way match:
   - ✅ Will fill: template key matches form field `name`
   - ⚠️ No match on page: template key has no form field (stale)
   - ⚠️ No value in template: form field has no template entry
4. If zero matches → error, no submit button shown
5. If at least one match → show "Fill and Submit" button
6. On submit: fill fields, dispatch `input` + `change` events, click submit button

### Why `name` not `id`

Only fields with a `name` attribute are included in HTML form POST.
`id` is used for DOM targeting only and is invisible to the server.
Bitwarden and other password managers prefer `id` first, which causes
silent POST failures. This bookmarklet uses `name` exclusively.

---

## Label detection (three patterns)

```typescript
// Pattern 1: <label for="el.id"> — most reliable, formal HTML standard
// Pattern 2: field is a descendant of <label> — also reliable
// Pattern 3: nearest preceding sibling <label> — heuristic, ~70-80% reliable
// Pattern 3b: parent container's preceding sibling is <label>
//             (CalendarWiz div-wrapper style — confirmed working in spike)
```

Spike results confirmed all four patterns working correctly against the
test server. Hidden fields correctly return pattern 0 / empty label.

Radio buttons need special handling — each radio is wrapped in its own
label (pattern 2) giving individual option text. Group label should come
from the shared `name` attribute context, not individual labels. Known
issue, not yet implemented.

Label text cleanup needed: strip child `<span>` text before reading
`textContent` — currently picks up annotation spans in test form.
Known issue, not yet implemented.

---

## React detection

Runs before anything else. If any signal is true, show error overlay and stop.

```typescript
// Signal 1: document.querySelector('[data-reactroot]') !== null
// Signal 2: typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined'
// Signal 3: form element has key starting with __reactFiber
//           or __reactInternalInstance
```

CalendarWiz and most WordPress/Drupal nonprofit sites are NOT React.
React detection is a graceful fallback, not a common case.

---

## Field filling

```typescript
el.value = value;
el.dispatchEvent(new Event('input', { bubbles: true }));
el.dispatchEvent(new Event('change', { bubbles: true }));
// For checkboxes: set checked = true if value === 'true' || value === 'on'
// For selects: set selectedIndex to option whose value matches
```

Hidden fields: must appear in POST unchanged. Bookmarklet must never
overwrite hidden fields from the template — they are shown in scan output
for user awareness only, marked as read-only in the UI.

---

## Iframe detection

CalendarWiz embeds via iframe on host sites (e.g. sanjosepeace.org).
Bookmarklet cannot cross iframe origin boundary — hard browser security wall.
Workaround: open the direct form URL in its own tab:
`https://www.calendarwiz.com/cwsuggest/cwsuggestform.php?crd=sanjosepeace`

Bookmarklet should detect when it is inside an iframe and show a helpful
message with the iframe src URL so the user knows where to navigate.
Not yet implemented.

---

## Module structure

Code is grouped into four component folders: a shared `core` layer that both
phases sit on, one folder per phase (`scan`, `fill`), and an `app` shell.
Each folder carries a `_COMPONENT_INFO.md` used by the UML docs generator.

```
src/
  core/
    types.ts       # shared interfaces, no deps
    dom.ts         # discoverFields(), detectLabel(), detectGroups()
    clipboard.ts   # readClipboard(), parseTemplate(), serializeTemplate()
    _COMPONENT_INFO.md
  scan/
    scan.ts        # buildTemplate(), buildScanViewModel()  — discovery phase
    _COMPONENT_INFO.md
  fill/
    fill.ts        # matchFields(), fillField(), runFill()  — fill phase
    _COMPONENT_INFO.md
  app/
    index.ts       # thin orchestration entry (esbuild entry point)
    overlay.ts     # showOverlay(), closeOverlay(), renderScanView(), renderFillView()
    detect.ts      # isReactForm(), isInsideIframe() — pure booleans
    _COMPONENT_INFO.md
tests/
  detect.test.ts        # 4 tests, all passing (imports src/app/detect.ts)
  dom.test.ts           # 17 tests (16 + 1 todo), jsdom vs fixtures/scan-form.html
  fixtures/scan-form.html  # mirror of the test-server form for hermetic tests
  clipboard.test.ts     # not yet written
  scan.test.ts          # not yet written
  fill.test.ts          # not yet written
scripts/
  wrap-bookmarklet.js  # prepends javascript: and encodeURIComponent, writes dist/bookmarklet.txt
```

Dependency direction (also rendered in README.md via the UML docs generator):
`app → scan, fill, core`; `scan → core`; `fill → core`. `core` depends on nothing.

---

## Current implementation state

### Done
- Project scaffolding: package.json, tsconfig.json, vitest.config.ts,
  eslint.config.js, prettier.config.js, .gitignore
- `src/core/types.ts` — all interfaces defined (incl. ScanViewModel)
- `src/app/detect.ts` — isReactForm() and isInsideIframe() implemented
- `src/core/dom.ts` — discoverFields(), detectLabel() (4 patterns), detectGroups()
  ported from the spike
- `src/core/clipboard.ts` — readClipboard(), parseTemplate(), serializeTemplate()
- `src/scan/scan.ts` — buildTemplate(), buildScanViewModel()
- `src/fill/fill.ts` — matchFields(), fillField(), runFill()
- `src/app/overlay.ts` — overlay render/inject (basic; manual-tested only)
- `src/app/index.ts` — orchestration entry: React/iframe guards, clipboard-based
  mode auto-detect (Fill vs Scan)
- `tests/detect.test.ts` (4) and `tests/dom.test.ts` (16 + 1 todo) passing
- `scripts/wrap-bookmarklet.js` — bookmarklet wrapper script
- NX migration complete — see below
- Documentation generation via build-tools plugins (autogen-markdown-doc): README
  TOC, component UML, and NX build-graph auto-generated and drift-checked in CI
- Spike: field discovery, all four label patterns, group detection
  validated against local test server (see spike notes below)

### Not yet started / known gaps
- `overlay.ts` is a basic implementation — the full scan table / fill-and-submit
  UI is not finished, and it is manual-test only
- Radio group labels (spike carry-forward): each radio reports its own option
  text instead of the shared group label — locked as `it.todo` in dom.test.ts
- `clipboard.test.ts`, `scan.test.ts`, `fill.test.ts` not yet written
- Server-integration and browser-E2E test tiers not yet added (test-server form
  is currently mirrored, not shared, by tests/fixtures/scan-form.html)

---

## NX migration — done

Single-project NX setup (matching `build-tools` NX `22.5.4`). esbuild is invoked
directly as a `command` target (not `@nx/esbuild`) — the bookmarklet bundle step
is non-standard. Config lives in `nx.json` (targetDefaults + namedInputs) and
`project.json`.

Targets: `build`, `build-dev`, `test` (dependsOn build), `lint`, `update-format`,
`check-format`, `update-docs`, `check-docs`, and `ci` (aggregates build, test,
lint, check-format, check-docs).

**Naming gotcha:** NX reserves `format` / `format:check` / `format:write` as
built-in commands, so the targets are named `update-format` / `check-format`
(never `format`) — matching the `build-tools` workspace convention.

`npm run <script>` entries delegate to NX (`build` → `nx build`, `format` →
`nx update-format`, `docs` → `nx update-docs`, etc.). `npx nx ci` is the local
gate equivalent to CI.

---

## Build

```bash
npm run build       # nx build → esbuild bundle + wrap-bookmarklet.js → dist/bookmarklet.txt
npm run build:dev   # nx build-dev → unminified bundle for debugging
npm test            # nx test (builds first via dependsOn) → vitest run
npm run lint        # nx lint → eslint src tests
npm run format      # nx update-format → prettier --write src tests
npm run docs        # nx update-docs → regenerate README auto-sections
npm run docs:check  # nx check-docs → CI drift check
npx nx ci           # full local gate: build + test + lint + check-format + check-docs
```

---

## Test server (spike / manual testing)

Located at `~/bw-form-test/`. Run with:

```bash
node ~/bw-form-test/server.js
# opens at http://localhost:3456
```

Covers: Pattern 1/2/3/3b labels, radio groups, hidden fields,
date/time multi-select clusters, all major input types.

To test the bookmarklet manually: paste contents of `dist/bookmarklet.txt`
as the URL of a new bookmark, navigate to localhost:3456, click it.

---

## Spike findings (label detection console output)

All patterns confirmed working:
- Group 1 (pattern 2): field wrapped in label ✅
- Group 2 (pattern 1): label for="id" ✅
- Group 3 (pattern 3): preceding sibling label, CalendarWiz div style ✅
- Group 6 (pattern 3b): date/time cluster, all resolve to "Start Date" / "Start Time" ✅
- Group 5 hidden fields: pattern 0, empty label ✅ (expected)

Known issues from spike:
1. Radio buttons return individual option label text instead of group label
2. Label text includes child span content (annotation spans in test form)

---

## Key design decisions (do not revisit without good reason)

- **`name` only for field matching** — never `id`, always `name`
- **Clipboard as template transport** — no localStorage, no server, just a text file
- **Single bookmarklet, auto-detected mode** — not two separate bookmarklets
- **No auto-submit** — always require user confirmation before submitting
- **`var` in bundled output** — avoid strict mode issues in some bookmarklet contexts
- **Hidden fields shown but not filled** — user sees them in scan, bookmarklet never overwrites
- **Overlay UI injected into page** — fixed position, inlined styles, no external CSS
- **esbuild → IIFE → encodeURIComponent** — build pipeline for final bookmarklet URL

---

## Coding conventions

- No object shorthand: always `{ key: value }` not `{ value }`
- Strict equality `===` everywhere
- Explicit presence checks, not truthiness checks
- `var` in bookmarklet runtime code (bookmarklet constraint)
- TypeScript with strict mode for source files
- Vitest + jsdom for unit tests
- Tests only for pure logic functions — overlay.ts and index.ts tested manually

