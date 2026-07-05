import { isReactForm, isInsideIframe } from "./detect.js";
import { buildScanViewModel } from "../scan/scan.js";
import { runFill, applyFill } from "../fill/fill.js";
import { readClipboard, looksLikeJson } from "../core/clipboard.js";
import { showScanOverlay, showFillOverlay, showErrorOverlay } from "./overlay.js";

// Thin orchestration only. Mode is auto-detected from the clipboard:
//   valid template  ⇒ Fill
//   looks like JSON but invalid  ⇒ Error
//   anything else  ⇒ Scan
void (async function main(): Promise<void> {
    if (isReactForm()) {
        alert("This form appears to be built with React. Not supported in this version.");
        return;
    }
    if (isInsideIframe()) {
        alert(
            "This form is inside an iframe. Open the form's direct URL in its own tab, then try again."
        );
        return;
    }

    const raw = await readClipboard();

    const fillViewModel = runFill(raw);
    if (fillViewModel !== null) {
        showFillOverlay(
            fillViewModel,
            function () {
                applyFill(fillViewModel);
            },
            function () {
                showScanOverlay(buildScanViewModel());
            }
        );
        return;
    }

    if (looksLikeJson(raw)) {
        showErrorOverlay(
            "Your clipboard looks like JSON but could not be parsed. " +
                "Check for missing braces, quotes, or commas, then try again."
        );
        return;
    }

    showScanOverlay(buildScanViewModel());
})();
