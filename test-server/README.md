# Test Server

Local Express server for manual bookmarklet testing. Serves a form
covering all field types and label detection patterns relevant to the
bookmarklet spike.

## Setup

```bash
cd test-server
npm install
```

## Run

```bash
node server.js
```

Opens at http://localhost:3456

## What it covers

- **Group 1** — Pattern 2 labels: field wrapped inside `<label>`
- **Group 2** — Pattern 1 labels: `<label for="id">` pointing to field by id
- **Group 3** — Pattern 3 labels: preceding sibling `<label>`, no formal association (CalendarWiz style)
- **Group 4** — Radio button group with shared `name`
- **Group 5** — Hidden fields with pre-set values (bookmarklet must not overwrite)
- **Group 6** — Date/time multi-select cluster (CalendarWiz style): month/day/year + hour/min/ampm
- **Group 7** — All four attributes: `name`, `id`, `aria-label`, `placeholder`

All fields have a `name` attribute so all POST. Submit echoes field names
and values back to the page.

## Manual bookmarklet test

1. Build: `npm run build` from project root
2. Copy contents of `dist/bookmarklet.txt`
3. Create a new bookmark with that as the URL
4. Navigate to http://localhost:3456
5. Click the bookmarklet
