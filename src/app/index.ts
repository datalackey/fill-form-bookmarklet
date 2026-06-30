import { isReactForm, isInsideIframe } from "../detect/detect.js";
import { buildScanViewModel } from "../scan/scan.js";
import { runFill } from "../fill/fill.js";
import { showOverlay, renderScanView, renderFillView } from "../overlay/overlay.js";

// Thin orchestration only. Mode is auto-detected from the clipboard: a valid
// template ⇒ Fill, otherwise ⇒ Scan.
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

    const fillResult = await runFill();
    if (fillResult !== null) {
        showOverlay(renderFillView(fillResult));
        return;
    }

    showOverlay(renderScanView(buildScanViewModel()));
})();
