# Spike — Field Discovery and Label Detection

Console-paste script that validates field discovery and label detection
logic against the test server. This is the direct prototype for `src/dom.ts`.

## How to run

1. Start the test server: `node test-server/server.js`
2. Open http://localhost:3456 in Chrome or Firefox
3. Open browser devtools console (F12)
4. Paste the contents of `scan-spike.js` and press Enter

## What it validates

- Field discovery via `name` attribute
- Label detection across all patterns:
  - Pattern 1: `<label for="id">`
  - Pattern 2: field wrapped inside `<label>`
  - Pattern 3: preceding sibling `<label>` (no formal association)
  - Pattern 3b: parent container's preceding sibling is `<label>` (CalendarWiz div-wrapper style)
- Group detection: fields sharing the same label text are clustered

## Confirmed findings

All patterns working correctly against test server:

| Row | Field | Label | Pattern |
|-----|-------|-------|---------|
| 0-5 | g1_* | Text, Email, etc. | 2 |
| 6-10 | g2_* | Text, Email, etc. | 1 |
| 11-14 | g3_* | Full Name, Email Address, etc. | 3 |
| 15-17 | g4_visibility | Public / Private / Members only | 2 |
| 18-20 | g5_* (hidden) | (empty) | 0 |
| 21-23 | g6_startmonth/day/year | Start Date | 3b |
| 24-26 | g6_starthour/min/ampm | Start Time | 3b |
| 27 | g7_name_text | Text — id wins... | 2 |

## Known issues (carry forward to dom.ts)

1. **Radio buttons** return individual option label text (`"Public"`, `"Private"`)
   instead of group label (`"Event visibility"`). Needs special handling in `dom.ts`.
2. **Label text includes child span content** — annotation `<span>` text is
   picked up by `textContent`. Strip child spans before reading label text in `dom.ts`.
