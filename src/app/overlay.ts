import { MatchResult, ScanViewModel } from "../core/types.js";

const OVERLAY_ID = "ffb-overlay";
const COPY_BTN_ID = "ffb-copy-btn";
const CANCEL_BTN_ID = "ffb-cancel-btn";
const COPY_CONFIRM_ID = "ffb-copy-confirm";

let escKeyHandler: ((e: KeyboardEvent) => void) | null = null;

function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Render the Scan-mode view: copy/cancel buttons, field table, JSON template block. */
export function renderScanView(model: ScanViewModel): string {
    const rows = model.fields
        .map(function (field) {
            const group = field.groupLabel === null ? "" : field.groupLabel;
            return (
                "<tr>" +
                '<td style="padding:4px 8px;border-bottom:1px solid #eee">' +
                escapeHtml(field.name) +
                '</td><td style="padding:4px 8px;border-bottom:1px solid #eee">' +
                escapeHtml(field.label) +
                '</td><td style="padding:4px 8px;border-bottom:1px solid #eee">' +
                escapeHtml(field.value) +
                '</td><td style="padding:4px 8px;border-bottom:1px solid #eee">' +
                escapeHtml(group) +
                "</td></tr>"
            );
        })
        .join("");

    return (
        '<h2 style="margin:0 0 12px;font-size:18px">Scan Results</h2>' +
        '<div style="margin-bottom:12px">' +
        '<button id="' +
        COPY_BTN_ID +
        '" style="background:#0070f3;color:#fff;border:none;padding:10px 18px;' +
        'font-size:15px;border-radius:4px;cursor:pointer;margin-right:8px">' +
        "Copy Template to Clipboard" +
        "</button>" +
        '<button id="' +
        CANCEL_BTN_ID +
        '" style="background:none;border:1px solid #999;padding:10px 14px;' +
        'font-size:15px;border-radius:4px;cursor:pointer;color:#555">' +
        "Cancel" +
        "</button>" +
        "</div>" +
        '<div id="' +
        COPY_CONFIRM_ID +
        '" style="display:none;background:#f0faf0;border:1px solid #4caf50;' +
        'border-radius:4px;padding:10px 14px;margin-bottom:12px;color:#2e7d32;font-size:14px">' +
        "&#x2713; Copied! Paste into a plain text file and save it. " +
        "Next time you submit this form, copy the file contents to your clipboard and click the bookmarklet " +
        "&#x2014; it will fill everything in automatically, and all you have to do then is press Submit." +
        "</div>" +
        '<h3 style="margin:0 0 4px;font-size:15px">Fields Found on This Page</h3>' +
        '<p style="margin:0 0 8px;color:#555;font-size:13px">' +
        "Review these to confirm the bookmarklet found everything you filled in." +
        "</p>" +
        '<table style="border-collapse:collapse;width:100%;margin-bottom:16px;font-size:13px">' +
        "<thead><tr>" +
        '<th style="text-align:left;border-bottom:2px solid #ccc;padding:4px 8px">name</th>' +
        '<th style="text-align:left;border-bottom:2px solid #ccc;padding:4px 8px">label</th>' +
        '<th style="text-align:left;border-bottom:2px solid #ccc;padding:4px 8px">value</th>' +
        '<th style="text-align:left;border-bottom:2px solid #ccc;padding:4px 8px">group</th>' +
        "</tr></thead>" +
        "<tbody>" +
        rows +
        "</tbody></table>" +
        '<h3 style="margin:0 0 4px;font-size:15px">Your Template (JSON)</h3>' +
        '<p style="margin:0 0 8px;color:#555;font-size:13px">' +
        "This is what gets saved to your text file. The bookmarklet reads it next time." +
        "</p>" +
        '<pre style="background:#f5f5f5;border:1px solid #ddd;border-radius:4px;' +
        'padding:10px;overflow:auto;font-size:12px;margin:0">' +
        escapeHtml(model.templateText) +
        "</pre>"
    );
}

/** Render the Fill-mode view: three-way match summary. */
export function renderFillView(result: MatchResult): string {
    return (
        "<h2>Fill</h2><ul>" +
        "<li>Will fill: " +
        result.willFill.length +
        "</li>" +
        "<li>Template keys not on page: " +
        result.noMatchOnPage.length +
        "</li>" +
        "<li>Page fields with no template value: " +
        result.noValueInTemplate.length +
        "</li></ul>"
    );
}

/** Inject a fixed-position overlay containing the given HTML into the page. */
export function showOverlay(html: string): void {
    closeOverlay();
    const container = document.createElement("div");
    container.id = OVERLAY_ID;
    container.style.position = "fixed";
    container.style.top = "10px";
    container.style.right = "10px";
    container.style.zIndex = "2147483647";
    container.style.background = "#fff";
    container.style.border = "1px solid #333";
    container.style.borderRadius = "6px";
    container.style.padding = "16px";
    container.style.maxHeight = "90vh";
    container.style.overflowY = "auto";
    container.style.maxWidth = "600px";
    container.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)";
    container.style.fontFamily = "sans-serif";
    container.innerHTML = html;
    document.body.appendChild(container);
}

/** Remove the bookmarklet overlay from the page if it is present. */
export function closeOverlay(): void {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing !== null) {
        existing.remove();
    }
    if (escKeyHandler !== null) {
        document.removeEventListener("keydown", escKeyHandler);
        escKeyHandler = null;
    }
}

/**
 * Render and inject the Scan overlay, then wire up Copy, Cancel, and Escape
 * so the overlay is always dismissed after any action.
 */
export function showScanOverlay(model: ScanViewModel): void {
    showOverlay(renderScanView(model));

    const copyBtn = document.getElementById(COPY_BTN_ID) as HTMLButtonElement | null;
    const cancelBtn = document.getElementById(CANCEL_BTN_ID) as HTMLButtonElement | null;
    const confirmEl = document.getElementById(COPY_CONFIRM_ID);

    if (cancelBtn !== null) {
        cancelBtn.addEventListener("click", closeOverlay);
    }

    if (copyBtn !== null && confirmEl !== null) {
        copyBtn.addEventListener("click", function () {
            navigator.clipboard.writeText(model.templateText).then(
                function () {
                    copyBtn.style.display = "none";
                    if (cancelBtn !== null) {
                        cancelBtn.style.display = "none";
                    }
                    confirmEl.style.display = "block";
                    setTimeout(closeOverlay, 4000);
                },
                function () {
                    copyBtn.textContent = "Copy failed — select and copy the JSON below manually";
                    copyBtn.style.background = "#c0392b";
                }
            );
        });
    }

    escKeyHandler = function (e: KeyboardEvent): void {
        if (e.key === "Escape") {
            closeOverlay();
        }
    };
    document.addEventListener("keydown", escKeyHandler);
}
