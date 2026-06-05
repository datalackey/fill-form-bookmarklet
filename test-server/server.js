const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const startDayOptions = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]
  .map(function(d) { return '<option value="' + d + '"' + (d === 2 ? ' selected' : '') + '>' + d + '</option>'; })
  .join('');

const startHourOptions = [1,2,3,4,5,6,7,8,9,10,11,12]
  .map(function(h) { return '<option value="' + h + '"' + (h === 7 ? ' selected' : '') + '>' + h + '</option>'; })
  .join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bookmarklet Spike Test Form</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    fieldset { margin-bottom: 24px; border: 1px solid #ccc; padding: 16px; }
    legend { font-weight: bold; padding: 0 8px; }
    label { display: block; margin-top: 12px; font-size: 0.9em; color: #333; }
    input[type=text], input[type=email], input[type=password], textarea, select {
      width: 100%; padding: 6px; margin-top: 4px; box-sizing: border-box;
    }
    input[type=checkbox], input[type=radio] { margin-top: 6px; }
    .attr-note { display: block; font-size: 0.75em; color: #888; font-family: monospace; margin-top: 2px; }
    .pattern-note { display: block; font-size: 0.75em; color: #b06000; font-family: monospace; margin-top: 2px; }
    .control-group { margin-top: 12px; }
    .field-row { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
    .field-row select { width: auto; min-width: 100px; }
    button[type=submit] { margin-top: 24px; padding: 10px 28px; font-size: 1em; }
  </style>
</head>
<body>
<h1>Bookmarklet Spike Test Form</h1>
<p>All fields have <code>name</code> so all POST. Tests label detection patterns and field type variations.</p>
<form method="POST" action="/submit">

  <!-- GROUP 1: Pattern 2 labels — field wrapped inside label -->
  <fieldset>
    <legend>Group 1 — Pattern 2 labels (field wrapped inside &lt;label&gt;)</legend>
    <label>Text
      <span class="attr-note">name="g1_text"</span>
      <input type="text" name="g1_text">
    </label>
    <label>Email
      <span class="attr-note">name="g1_email"</span>
      <input type="email" name="g1_email">
    </label>
    <label>Password
      <span class="attr-note">name="g1_password"</span>
      <input type="password" name="g1_password">
    </label>
    <label>Textarea
      <span class="attr-note">name="g1_textarea"</span>
      <textarea name="g1_textarea" rows="2"></textarea>
    </label>
    <label>Checkbox
      <span class="attr-note">name="g1_checkbox"</span>
      <input type="checkbox" name="g1_checkbox" value="on">
    </label>
    <label>Select
      <span class="attr-note">name="g1_select"</span>
      <select name="g1_select">
        <option value="">-- choose --</option>
        <option value="alpha">Alpha</option>
        <option value="beta">Beta</option>
      </select>
    </label>
  </fieldset>

  <!-- GROUP 2: Pattern 1 labels — label for="id" -->
  <fieldset>
    <legend>Group 2 — Pattern 1 labels (&lt;label for=&quot;id&quot;&gt; pointing to field by id)</legend>
    <label for="g2_text_id">Text
      <span class="pattern-note">label for="g2_text_id"</span>
    </label>
    <input type="text" name="g2_text" id="g2_text_id">
    <label for="g2_email_id">Email
      <span class="pattern-note">label for="g2_email_id"</span>
    </label>
    <input type="email" name="g2_email" id="g2_email_id">
    <label for="g2_textarea_id">Textarea
      <span class="pattern-note">label for="g2_textarea_id"</span>
    </label>
    <textarea name="g2_textarea" id="g2_textarea_id" rows="2"></textarea>
    <label for="g2_select_id">Select
      <span class="pattern-note">label for="g2_select_id"</span>
    </label>
    <select name="g2_select" id="g2_select_id">
      <option value="">-- choose --</option>
      <option value="alpha">Alpha</option>
      <option value="beta">Beta</option>
    </select>
    <label for="g2_checkbox_id">Checkbox
      <span class="pattern-note">label for="g2_checkbox_id"</span>
    </label>
    <input type="checkbox" name="g2_checkbox" id="g2_checkbox_id" value="on">
  </fieldset>

  <!-- GROUP 3: Pattern 3 labels — preceding sibling, no formal association -->
  <fieldset>
    <legend>Group 3 — Pattern 3 labels (preceding sibling &lt;label&gt;, no for/wrap — CalendarWiz style)</legend>
    <div class="control-group">
      <label class="control-label">Full Name</label>
      <input type="text" name="g3_fullname">
      <span class="pattern-note">label is preceding sibling, no for attribute</span>
    </div>
    <div class="control-group">
      <label class="control-label">Email Address</label>
      <input type="email" name="g3_email">
      <span class="pattern-note">label is preceding sibling, no for attribute</span>
    </div>
    <div class="control-group">
      <label class="control-label">Notes</label>
      <textarea name="g3_notes" rows="2"></textarea>
      <span class="pattern-note">label is preceding sibling, no for attribute</span>
    </div>
    <div class="control-group">
      <label class="control-label">Category</label>
      <select name="g3_category">
        <option value="">-- choose --</option>
        <option value="community">Community</option>
        <option value="action">Action</option>
        <option value="webinar">Webinar</option>
      </select>
      <span class="pattern-note">label is preceding sibling, no for attribute</span>
    </div>
  </fieldset>

  <!-- GROUP 4: Radio button group -->
  <fieldset>
    <legend>Group 4 — Radio button group</legend>
    <p style="font-size:0.9em;color:#333;margin:0 0 8px;">Event visibility
      <span class="attr-note">name="g4_visibility" shared across all radios</span>
    </p>
    <label><input type="radio" name="g4_visibility" value="public"> Public</label>
    <label><input type="radio" name="g4_visibility" value="private"> Private</label>
    <label><input type="radio" name="g4_visibility" value="members"> Members only</label>
  </fieldset>

  <!-- GROUP 5: Hidden fields — bookmarklet must not overwrite -->
  <fieldset>
    <legend>Group 5 — Hidden fields (bookmarklet must not overwrite these)</legend>
    <input type="hidden" name="g5_calendar_id" value="97241">
    <input type="hidden" name="g5_actiontype" value="suggest">
    <input type="hidden" name="g5_savesubmit" value="true">
    <p style="font-size:0.85em;color:#666;">
      Three hidden fields: <code>g5_calendar_id=97241</code>,
      <code>g5_actiontype=suggest</code>, <code>g5_savesubmit=true</code>.
      These must appear in POST unchanged. Bookmarklet must never touch them.
    </p>
  </fieldset>

  <!-- GROUP 6: Date/time multi-select cluster — CalendarWiz style -->
  <fieldset>
    <legend>Group 6 — Date/time multi-select cluster (CalendarWiz style)</legend>
    <div class="control-group">
      <label class="control-label">Start Date</label>
      <div class="field-row">
        <select name="g6_startmonth">
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6" selected>June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
        <select name="g6_startday">${startDayOptions}</select>
        <select name="g6_startyear">
          <option value="2025">2025</option>
          <option value="2026" selected>2026</option>
          <option value="2027">2027</option>
        </select>
      </div>
      <span class="pattern-note">names: g6_startmonth, g6_startday, g6_startyear — grouped under "Start Date" label</span>
    </div>
    <div class="control-group" style="margin-top:16px;">
      <label class="control-label">Start Time</label>
      <div class="field-row">
        <select name="g6_starthour">${startHourOptions}</select>
        <select name="g6_startmin">
          <option value="00" selected>00</option>
          <option value="15">15</option>
          <option value="30">30</option>
          <option value="45">45</option>
        </select>
        <select name="g6_startampm">
          <option value="am">AM</option>
          <option value="pm" selected>PM</option>
        </select>
      </div>
      <span class="pattern-note">names: g6_starthour, g6_startmin, g6_startampm — grouped under "Start Time" label</span>
    </div>
  </fieldset>

  <!-- GROUP 7: All four attributes present -->
  <fieldset>
    <legend>Group 7 — All four attributes (name + id + aria-label + placeholder)</legend>
    <label>Text — id wins for Bitwarden, name wins for POST
      <span class="attr-note">name="g7_name_text" id="g7_id_text" aria-label="g7_aria_text" placeholder="g7_placeholder_text"</span>
      <input type="text"
             name="g7_name_text"
             id="g7_id_text"
             aria-label="g7_aria_text"
             placeholder="g7_placeholder_text">
    </label>
  </fieldset>

  <button type="submit">Submit — echo all fields</button>
</form>
</body>
</html>`;

app.get('/', (req, res) => res.send(html));

app.post('/submit', (req, res) => {
  const body = req.body;
  const rows = Object.entries(body)
    .map(([key, value]) => `<tr><td><code>${key}</code></td><td><code>${value}</code></td></tr>`)
    .join('');

  res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Echo</title>
<style>
  body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
  th { background: #f5f5f5; }
</style></head>
<body>
<h1>Submitted Fields</h1>
<p>Hidden fields will appear here. Bookmarklet must not have overwritten them.</p>
<table>
  <thead><tr><th>name attribute</th><th>submitted value</th></tr></thead>
  <tbody>${rows || '<tr><td colspan="2">nothing submitted</td></tr>'}</tbody>
</table>
<p><a href="/">&#8592; Back to form</a></p>
</body></html>`);
});

const PORT = 3456;
app.listen(PORT, () => {
  console.log('Bookmarklet spike test form running at http://localhost:' + PORT);
});
