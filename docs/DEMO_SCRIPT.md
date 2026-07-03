# Screen-recording demo script

A shot script for a screen-capture demo of the Form Fill bookmarklet.

**Audience:** grassroots / nonprofit community advisors who promote *recurring*
events (a weekly vigil, a monthly meeting) and must submit them to web calendars
with **no native recurrence** — the WordPress-nonprofit tier and CalendarWiz-style
backends where the same event is re-entered by hand every time.

**Format:** full-screen capture, browser on the **left** (~55%), terminal on the
**right** (~45%). The terminal shows **only the JSON** — copied in Clip 1, pasted
into a file in Clip 2. Record the ACTION column; overlay the NARRATION as voiceover
afterward.

**Arc:** Cold open → Clip 1 (hero + segue) → Clip 2 (install + scan setup).
Deliver as **two clips**: a ~60s hero and a ~85s setup piece.

---

## Pre-flight setup (do once, before recording)

- **Chrome zoom: 150–175%** (`Ctrl/Cmd +`) — the single biggest legibility win for
  viewers on small screens.
- **Terminal font: ~20–22pt.** The JSON is the only thing on that side; make it large.
- **Layout:** browser left ~55%, terminal right ~45%. Bookmarks bar visible
  (`Ctrl/Cmd+Shift+B`).
- **Click highlighting on** (recorder overlay or a tool like Keycastr) so viewers can
  follow the drag and the button clicks.
- **Two Chrome profiles:** Clip 1 uses a profile with the bookmarklet **already
  installed**; Clip 2 uses a **fresh** profile (empty bookmarks bar) so the install is real.
- **Run a fresh `npm run build` first** so the embedded bookmarklet hash matches the
  live install page.
- **Move deliberately:** pause ~1.5s on each key screen. On-screen dwell is what gives
  the later voiceover room to land.
- Chrome does **not** prompt when dragging a `javascript:` link, so the drag is clean.

---

## COLD OPEN — Intro (~12–15s, before the hero)

| ACTION | NARRATION |
|---|---|
| Show the blank calendar event form in the browser (optionally the org's public calendar first, then the empty form). | "If you help run a community group, you probably post the same recurring events over and over — a weekly vigil, a monthly meeting — into a web calendar that has no 'repeat' button. So every time, you retype it all by hand. This is a free bookmark that does that for you in one click — no software to install, no account." |

**Shorter alternates:**

- *Tightest (~8s):* "Community groups post the same recurring events again and again —
  into calendars with no 'repeat' button. This free bookmark fills the whole form for
  you in one click."
- *With a light dig at the culprit:* "A lot of nonprofit and WordPress calendars still
  can't repeat an event automatically — so if you run a weekly vigil or a monthly
  meeting, you retype it every time. Here's a free bookmark that does it in one click
  instead."

---

## CLIP 1 — The hero: fill a form in one click (~60s)

*Precondition: bookmarklet installed; a saved template JSON open/visible in the
terminal; the event form open in a blank state in the browser.*

| # | ACTION (capture this) | NARRATION (read later) |
|---|---|---|
| 1 | Terminal (right) showing the saved JSON template, formatted. | "This is an event I submitted last month — saved as a plain text file. Same event, every month." |
| 2 | Select all the JSON, `Ctrl/Cmd+C`. Let the selection highlight show. | "I copy it — that's the whole prep. No app, no login." |
| 3 | Click into the browser (left): the blank calendar event form. | "Here's the calendar's submission form. Normally I'd retype all of this by hand, every single time." |
| 4 | Click the **☰ Form Fill** bookmark in the bar. | "Instead, I click my bookmark." |
| 5 | Overlay appears: **"Ready to Fill"** with the fields table + **Fill Form** button. Pause on it. | "It reads what I copied, matches it against this page, and shows me exactly what it's about to fill." |
| 6 | Click **Fill Form**. Overlay closes; every field populates. | "One click — title, location, date, time, description. All of it." |
| 7 | Scroll the now-filled form slowly, top to bottom. | "Nothing's submitted yet. I get to review it first — and change the date if this month's is different." |
| 8 | Click the form's own **Submit** button. Land on the confirmation page; hold ~2s. | "When it looks right, I submit. A minute of work instead of fifteen — and I'll do the exact same thing next month." |
| 9 | **Segue beat:** slowly move the cursor up to the **☰ Form Fill** bookmark and the terminal's JSON file, then let it rest. | "But that one-click magic depends on two things being in place: this bookmark, and that saved template. Setting both up is a one-time job — about a minute — so let me show you how it's done." |

*Shorter alt for step 9:* "Two things made that possible — the bookmark, and the
saved template. Here's the one-time setup that creates them."

---

## CLIP 2 — One-time setup (~85s)

### 2a · Install the bookmarklet (drag) — fresh Chrome profile

| # | ACTION | NARRATION |
|---|---|---|
| 1 | Fresh Chrome, empty bookmarks bar visible. Go to `datalackey.github.io/fill-form-bookmarklet/`. | "Setting this up takes about a minute, and you only do it once." |
| 2 | Page loads on Step 1, the blue **☰ Form Fill** button visible. | "A bookmarklet is just a bookmark whose address is a tiny script instead of a web page — no extension, no account." |
| 3 | **Drag** the ☰ button up onto the bookmarks bar. It lands as a bookmark. | "So you install it by dragging it to your bookmarks bar. That's it — it's yours now." |

### 2b · Capture a template from a new form (Scan)

| # | ACTION | NARRATION |
|---|---|---|
| 4 | Go to the calendar event form (blank). Fill it out **by hand** once. | "The first time on any form, you fill it out the normal way — by hand." |
| 5 | Click the **☰ Form Fill** bookmark. | "Then click the bookmark with your clipboard empty…" |
| 6 | Overlay: **"Scan Results"** — fields table + JSON preview + **Copy Template to Clipboard**. Pause. | "…and instead of filling, it reads the form and hands you a reusable template of everything you just entered." |
| 7 | Click **Copy Template to Clipboard**. Green **"Copied!"** confirmation shows. | "Copy it." |
| 8 | Switch to terminal/editor. Paste the JSON into a new file. Save it (e.g. `peace-vigil.json`). | "Paste it into a plain text file and save it. That's your template for this event, forever." |
| 9 | *(Optional 2s)* Tab back to Clip 1's first screen. | "Next month? Open the file, copy, click, submit. Back to that one-click flow you saw first." |

---

## Editing notes

- **Clip order:** hero *first* to hook viewers, then the setup reveal. Clip 1 step 9
  bridges into Clip 2, which opens on "Setting this up takes about a minute…".
- **Getting JSON into the clipboard in Clip 1:** selecting multi-line JSON in a
  terminal can be fiddly on camera. If a take fumbles, `cat peace-vigil.json | pbcopy`
  (or `clip.exe` on WSL) is a clean off-screen alternative — but the visible
  select+copy is more relatable for this audience, so try that first.
