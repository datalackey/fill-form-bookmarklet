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

```
src/
  index.ts       # thin orchestration only, no logic
  types.ts       # shared interfaces, no deps
  detect.ts      # isReactForm(), isInsideIframe() — pure booleans
  dom.ts         # discoverFields(), detectLabel(), detectGroups()
  clipboard.ts   # readClipboard(), parseTemplate()
  scan.ts        # buildTemplate(), buildScanViewModel()
  fill.ts        # matchFields(), fillField()
  overlay.ts     # showOverlay(), closeOverlay(), renderScanView(), renderFillView()
tests/
  detect.test.ts  # exists, 4 tests, all passing
  dom.test.ts     # not yet written
  clipboard.test.ts # not yet written
  scan.test.ts    # not yet written
  fill.test.ts    # not yet written
scripts/
  wrap-bookmarklet.js  # prepends javascript: and encodeURIComponent, writes dist/bookmarklet.txt
```

---

## Current implementation state

### Done
- Project scaffolding: package.json, tsconfig.json, vitest.config.ts,
  eslint.config.js, prettier.config.js, .gitignore
- `src/types.ts` — all interfaces defined
- `src/detect.ts` — isReactForm() implemented
- `src/index.ts` — hello world IIFE calling isReactForm()
- `tests/detect.test.ts` — 4 passing tests
- `scripts/wrap-bookmarklet.js` — bookmarklet wrapper script
- Spike: field discovery, all three label patterns, group detection
  validated against local test server (see spike notes below)

### Not yet started
- `src/dom.ts`
- `src/clipboard.ts`
- `src/scan.ts`
- `src/fill.ts`
- `src/overlay.ts`
- NX migration (see below)
- Documentation generation via build-tools plugins

---

## NX migration — planned, not yet done

The project currently uses plain `package.json` scripts. Plan is to
migrate to NX for consistency with the `build-tools` monorepo conventions.

**Before starting NX migration, read:**
- `build-tools` root `package.json` for NX version and plugins in use
- An existing `project.json` from a `build-tools` package for target conventions
- `nx.json` from `build-tools` for global NX config

The `build-tools` monorepo uses NX 22.x. Match that version.
Check whether `@nx/esbuild` is used or whether esbuild is invoked directly
via a custom executor or `package.json` script — this project needs esbuild
for the bookmarklet bundle step which is non-standard.

---

## Build

```bash
npm run build       # esbuild bundle + wrap-bookmarklet.js → dist/bookmarklet.txt
npm run build:dev   # unminified bundle for debugging
npm test            # vitest run
npm run lint        # eslint src tests
npm run format      # prettier --write src tests
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

