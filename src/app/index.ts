import { isReactForm, isInsideIframe } from "./detect.js";
import { buildScanViewModel } from "../scan/scan.js";
import { runFill, applyFill } from "../fill/fill.js";
import { showScanOverlay, showFillOverlay } from "./overlay.js";

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

    const fillViewModel = await runFill();
    if (fillViewModel !== null) {
        showFillOverlay(fillViewModel, function () {
            applyFill(fillViewModel);
            const submitBtn = document.querySelector(
                'input[type="submit"], button[type="submit"]'
            ) as HTMLElement | null;
            if (submitBtn !== null) {
                submitBtn.click();
            }
        });
        return;
    }

    showScanOverlay(buildScanViewModel());
})();
