// Run from: project root
// Usage: node scripts/generate-install-page.js

import { readFileSync, writeFileSync } from 'fs';

var bookmarklet = readFileSync('dist/bookmarklet.txt', 'utf8').trim();

// Safe to embed directly in <textarea> — encodeURIComponent output contains no HTML-special chars
var html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Install — Form Fill Bookmarklet</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #222;
      background: #f5f5f5;
      margin: 0;
      padding: 2rem 1rem 4rem;
    }

    .container {
      max-width: 680px;
      margin: 0 auto;
    }

    h1 { font-size: 1.6rem; margin: 0 0 0.25rem; }
    h2 { font-size: 1.1rem; margin: 2rem 0 0.5rem; }

    .tagline {
      color: #555;
      margin: 0 0 2rem;
    }

    .step {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.25rem;
    }

    .step-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #888;
      margin: 0 0 0.4rem;
    }

    .step h2 { margin: 0 0 0.75rem; font-size: 1rem; }

    textarea {
      width: 100%;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 0.78rem;
      line-height: 1.4;
      resize: none;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 0.6rem 0.75rem;
      background: #f9f9f9;
      color: #333;
      height: 5.5rem;
    }

    textarea:focus { outline: 2px solid #4a90e2; border-color: transparent; }

    .copy-row {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin-top: 0.5rem;
    }

    button {
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 5px;
      padding: 0.5rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }

    button:hover { background: #1d4ed8; }
    button:active { background: #1e40af; }

    .drag-link {
      display: inline-block;
      background: #2563eb;
      color: #fff;
      text-decoration: none;
      font-size: 1rem;
      font-weight: 600;
      padding: 0.6rem 1.4rem;
      border: 1px solid #1d4ed8;
      border-radius: 6px;
      cursor: grab;
    }

    .drag-link:hover { background: #1d4ed8; }
    .drag-link:active { cursor: grabbing; }

    details { margin-top: 0.75rem; }

    summary {
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      color: #2563eb;
    }

    details[open] summary { margin-bottom: 0.5rem; }

    .copy-status {
      font-size: 0.85rem;
      color: #16a34a;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .copy-status.visible { opacity: 1; }

    ol { padding-left: 1.25rem; margin: 0.5rem 0 0; }
    ol li { margin-bottom: 0.35rem; }

    .browser-tabs {
      display: flex;
      gap: 0;
      border-bottom: 2px solid #e5e7eb;
      margin-bottom: 1rem;
    }

    .tab {
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      padding: 0.35rem 0.9rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      border-radius: 0;
    }

    .tab.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
      background: none;
    }

    .tab:hover { color: #2563eb; background: none; }

    .instructions { display: none; }
    .instructions.active { display: block; }

    kbd {
      font-family: inherit;
      font-size: 0.82em;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 3px;
      padding: 0.1em 0.4em;
    }

    .note {
      font-size: 0.85rem;
      color: #666;
      margin-top: 0.75rem;
    }

    footer {
      text-align: center;
      font-size: 0.8rem;
      color: #aaa;
      margin-top: 3rem;
    }

    footer a { color: #aaa; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Form Fill Bookmarklet</h1>
    <p class="tagline">Fill out a repeating calendar form once, save a template, and re-submit with one click.</p>

    <div class="step">
      <div class="step-label">Step 1 of 3</div>
      <h2>Drag this button to your bookmarks bar</h2>
      <p>Drag the blue button up onto your browser's bookmarks bar. That's the whole install &mdash; no extensions, no accounts.</p>
      <p><a class="drag-link" href="${bookmarklet}" onclick="return false" title="Drag me to your bookmarks bar">&#9776; Form Fill</a></p>
      <details>
        <summary>Can't drag it? Copy the text instead</summary>
        <p>Select all the text below and copy it, or use the button, then follow Step 2.</p>
        <textarea id="bookmarklet-text" readonly spellcheck="false" autocomplete="off">${bookmarklet}</textarea>
        <div class="copy-row">
          <button id="copy-btn" onclick="copyBookmarklet()">Copy to Clipboard</button>
          <span class="copy-status" id="copy-status">Copied!</span>
        </div>
      </details>
    </div>

    <div class="step">
      <div class="step-label">Step 2 of 3</div>
      <h2>Prefer copy/paste? Add it as a bookmark manually</h2>
      <p class="note" style="margin-top:0">Skip this if you dragged the button in Step 1 &mdash; you're already done.</p>

      <div class="browser-tabs">
        <button class="tab active" onclick="showTab('chrome', this)">Chrome / Edge</button>
        <button class="tab" onclick="showTab('firefox', this)">Firefox</button>
        <button class="tab" onclick="showTab('safari', this)">Safari</button>
      </div>

      <div class="instructions active" id="tab-chrome">
        <ol>
          <li>Press <kbd>Ctrl+Shift+B</kbd> (Windows) or <kbd>Cmd+Shift+B</kbd> (Mac) to show the bookmarks bar.</li>
          <li>Right-click an empty spot on the bookmarks bar and choose <strong>Add page&hellip;</strong> (Chrome) or <strong>Add bookmark</strong> (Edge).</li>
          <li>Set the <strong>Name</strong> to something like <em>Form Fill</em>.</li>
          <li>Clear the <strong>URL</strong> field completely, then paste what you copied in Step 1.</li>
          <li>Click <strong>Save</strong>.</li>
        </ol>
      </div>

      <div class="instructions" id="tab-firefox">
        <ol>
          <li>Press <kbd>Ctrl+Shift+B</kbd> (Windows) or <kbd>Cmd+Shift+B</kbd> (Mac) to show the bookmarks toolbar.</li>
          <li>Right-click the toolbar and choose <strong>Add Bookmark&hellip;</strong></li>
          <li>Set the <strong>Name</strong> to <em>Form Fill</em>.</li>
          <li>Clear the <strong>Location</strong> field and paste what you copied in Step 1.</li>
          <li>Click <strong>Save</strong>.</li>
        </ol>
      </div>

      <div class="instructions" id="tab-safari">
        <ol>
          <li>In the menu bar, choose <strong>Bookmarks &rarr; Add Bookmark&hellip;</strong></li>
          <li>Change the destination to <strong>Favorites Bar</strong>, then click <strong>Add</strong>.</li>
          <li>In the Favorites Bar, right-click the new bookmark and choose <strong>Edit Address</strong>.</li>
          <li>Clear the address field and paste what you copied in Step 1.</li>
          <li>Press <kbd>Return</kbd>.</li>
        </ol>
      </div>

      <p class="note">The bookmarklet is just a browser bookmark whose URL is a tiny JavaScript program. No extensions or accounts needed.</p>
    </div>

    <div class="step">
      <div class="step-label">Step 3 of 3</div>
      <h2>Use it</h2>
      <ol>
        <li>Navigate to the calendar event form you want to fill out.</li>
        <li><strong>First time only:</strong> Fill the form by hand, then click the bookmarklet to capture a template. Copy the template text and save it in a plain text file.</li>
        <li><strong>Every time after:</strong> Open your saved template, update the date (and any other fields that changed), copy it to your clipboard, then navigate to the form and click the bookmarklet. It will fill everything in for you.</li>
        <li>Review the pre-filled form, then click <strong>Fill and Submit</strong>.</li>
      </ol>
    </div>

    <footer>
      <a href="https://github.com/datalackey/fill-form-bookmarklet">View source on GitHub</a>
    </footer>
  </div>

  <script>
    function copyBookmarklet() {
      var text = document.getElementById('bookmarklet-text').value;
      var status = document.getElementById('copy-status');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          showCopied(status);
        });
      } else {
        var el = document.getElementById('bookmarklet-text');
        el.select();
        document.execCommand('copy');
        showCopied(status);
      }
    }

    function showCopied(status) {
      status.classList.add('visible');
      setTimeout(function() { status.classList.remove('visible'); }, 2000);
    }

    function showTab(name, btn) {
      var instructions = document.querySelectorAll('.instructions');
      for (var i = 0; i < instructions.length; i++) {
        instructions[i].classList.remove('active');
      }
      var tabs = document.querySelectorAll('.tab');
      for (var j = 0; j < tabs.length; j++) {
        tabs[j].classList.remove('active');
      }
      document.getElementById('tab-' + name).classList.add('active');
      btn.classList.add('active');
    }
  </script>
</body>
</html>`;

writeFileSync('dist/index.html', html, 'utf8');
console.log('Install page written to dist/index.html');
