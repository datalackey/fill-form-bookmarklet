import { FillViewModel, ScanViewModel } from "../core/types.js";
import styles from "./overlay.css";

const OVERLAY_ID = "ffb-overlay";
const STYLES_ID = "ffb-styles";
const COPY_BTN_ID = "ffb-copy-btn";
const CANCEL_BTN_ID = "ffb-cancel-btn";
const COPY_CONFIRM_ID = "ffb-copy-confirm";
const FILL_BTN_ID = "ffb-fill-btn";
const FILL_CANCEL_BTN_ID = "ffb-fill-cancel-btn";
const SCAN_INSTEAD_BTN_ID = "ffb-scan-instead-btn";
const ERROR_CANCEL_BTN_ID = "ffb-error-cancel-btn";

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
                '<td class="ffb-table-cell">' +
                escapeHtml(field.name) +
                "</td><td>" +
                escapeHtml(field.label) +
                "</td><td>" +
                escapeHtml(field.value) +
                "</td><td>" +
                escapeHtml(group) +
                "</td></tr>"
            );
        })
        .join("");

    return (
        "<h2>Scan Results</h2>" +
        '<div class="ffb-btn-row">' +
        '<button id="' +
        COPY_BTN_ID +
        '" class="ffb-btn-primary">' +
        "Copy Template to Clipboard" +
        "</button>" +
        '<button id="' +
        CANCEL_BTN_ID +
        '" class="ffb-btn-cancel">' +
        "Cancel" +
        "</button>" +
        "</div>" +
        '<div id="' +
        COPY_CONFIRM_ID +
        '">' +
        "&#x2713; Copied! Paste into a plain text file and save it. " +
        "Next time you submit this form, copy the file contents to your clipboard and click the bookmarklet " +
        "&#x2014; it will fill everything in automatically, and all you have to do then is press Submit." +
        "</div>" +
        "<h3>Fields Found on This Page</h3>" +
        '<p class="ffb-desc">' +
        "Review these to confirm the bookmarklet found everything you filled in." +
        "</p>" +
        '<table class="ffb-table">' +
        "<thead><tr>" +
        "<th>name</th>" +
        "<th>label</th>" +
        "<th>value</th>" +
        "<th>group</th>" +
        "</tr></thead>" +
        "<tbody>" +
        rows +
        "</tbody></table>" +
        "<h3>Your Template (JSON)</h3>" +
        '<p class="ffb-desc">' +
        "This is what gets saved to your text file. The bookmarklet reads it next time." +
        "</p>" +
        '<pre class="ffb-pre">' +
        escapeHtml(model.templateText) +
        "</pre>"
    );
}

/** Render the Fill-mode view: match table and action buttons. */
export function renderFillView(vm: FillViewModel): string {
    const result = vm.result;

    if (result.willFill.length === 0) {
        return (
            "<h2>Nothing to Fill</h2>" +
            '<p class="ffb-desc">' +
            "No fields in your template match this page. " +
            "Your template may be from a different form." +
            "</p>" +
            '<button id="' +
            FILL_CANCEL_BTN_ID +
            '" class="ffb-btn-cancel">' +
            "Close" +
            "</button>" +
            '<button id="' +
            SCAN_INSTEAD_BTN_ID +
            '" class="ffb-btn-link">' +
            "Scan this form instead" +
            "</button>" +
            '<hr class="ffb-divider">' +
            "<h3>Template found in clipboard</h3>" +
            '<pre class="ffb-pre">' +
            escapeHtml(JSON.stringify(vm.template, null, 2)) +
            "</pre>"
        );
    }

    const fillRows = result.willFill
        .map(function (field) {
            return (
                "<tr>" +
                "<td>" +
                escapeHtml(field.name) +
                "</td><td>" +
                escapeHtml(field.label) +
                "</td><td>" +
                escapeHtml(vm.template[field.name]) +
                "</td></tr>"
            );
        })
        .join("");

    let staleSection = "";
    if (result.noMatchOnPage.length > 0) {
        const staleItems = result.noMatchOnPage
            .map(function (key) {
                return "<li>" + escapeHtml(key) + "</li>";
            })
            .join("");
        staleSection =
            '<h3 class="ffb-stale-heading">' +
            "Stale template keys (" +
            result.noMatchOnPage.length +
            ")</h3>" +
            '<p class="ffb-mini-desc">' +
            "These keys are in your template but have no matching field on this page:" +
            "</p>" +
            '<ul class="ffb-list">' +
            staleItems +
            "</ul>";
    }

    let unmatchedSection = "";
    if (result.noValueInTemplate.length > 0) {
        const unmatchedItems = result.noValueInTemplate
            .map(function (field) {
                return "<li>" + escapeHtml(field.name) + "</li>";
            })
            .join("");
        unmatchedSection =
            '<h3 class="ffb-unmatched-heading">' +
            "Page fields not in template (" +
            result.noValueInTemplate.length +
            ")</h3>" +
            '<p class="ffb-mini-desc">' +
            "These fields will be left as-is:" +
            "</p>" +
            '<ul class="ffb-list">' +
            unmatchedItems +
            "</ul>";
    }

    return (
        "<h2>Ready to Fill</h2>" +
        '<div class="ffb-btn-row">' +
        '<button id="' +
        FILL_BTN_ID +
        '" class="ffb-btn-fill">' +
        "Fill Form" +
        "</button>" +
        '<button id="' +
        FILL_CANCEL_BTN_ID +
        '" class="ffb-btn-cancel">' +
        "Cancel" +
        "</button>" +
        '<button id="' +
        SCAN_INSTEAD_BTN_ID +
        '" class="ffb-btn-link">' +
        "Scan this form instead" +
        "</button>" +
        "</div>" +
        "<h3>Fields to Fill (" +
        result.willFill.length +
        ")</h3>" +
        '<table class="ffb-table">' +
        "<thead><tr>" +
        "<th>name</th>" +
        "<th>label</th>" +
        "<th>value</th>" +
        "</tr></thead>" +
        "<tbody>" +
        fillRows +
        "</tbody></table>" +
        staleSection +
        unmatchedSection
    );
}

/**
 * Render and inject the Fill overlay, then wire up Fill and Submit, Cancel,
 * and Escape. Calls onFill() (closes overlay first) when the user confirms.
 */
export function showFillOverlay(
    vm: FillViewModel,
    onFill: () => void,
    onScanInstead: () => void
): void {
    showOverlay(renderFillView(vm));

    const fillBtn = document.getElementById(FILL_BTN_ID) as HTMLButtonElement | null;
    const cancelBtn = document.getElementById(FILL_CANCEL_BTN_ID) as HTMLButtonElement | null;
    const scanInsteadBtn = document.getElementById(SCAN_INSTEAD_BTN_ID) as HTMLButtonElement | null;

    if (cancelBtn !== null) {
        cancelBtn.addEventListener("click", closeOverlay);
    }

    if (scanInsteadBtn !== null) {
        scanInsteadBtn.addEventListener("click", function () {
            closeOverlay();
            onScanInstead();
        });
    }

    if (fillBtn !== null) {
        fillBtn.addEventListener("click", function () {
            closeOverlay();
            onFill();
        });
    }

    escKeyHandler = function (e: KeyboardEvent): void {
        if (e.key === "Escape") {
            closeOverlay();
        }
    };
    document.addEventListener("keydown", escKeyHandler);
}

/** Show an error overlay with a message and a Close button. */
export function showErrorOverlay(message: string): void {
    showOverlay(
        '<h2 class="ffb-error-heading">Template Error</h2>' +
            '<p class="ffb-error-msg">' +
            escapeHtml(message) +
            "</p>" +
            '<button id="' +
            ERROR_CANCEL_BTN_ID +
            '" class="ffb-btn-cancel">' +
            "Close" +
            "</button>"
    );

    const cancelBtn = document.getElementById(ERROR_CANCEL_BTN_ID) as HTMLButtonElement | null;
    if (cancelBtn !== null) {
        cancelBtn.addEventListener("click", closeOverlay);
    }

    escKeyHandler = function (e: KeyboardEvent): void {
        if (e.key === "Escape") {
            closeOverlay();
        }
    };
    document.addEventListener("keydown", escKeyHandler);
}

/** Inject a fixed-position overlay containing the given HTML into the page. */
export function showOverlay(html: string): void {
    closeOverlay();

    if (document.getElementById(STYLES_ID) === null) {
        const styleEl = document.createElement("style");
        styleEl.id = STYLES_ID;
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
    }

    const container = document.createElement("div");
    container.id = OVERLAY_ID;
    container.innerHTML =
        html +
        '<div class="ffb-footer">' +
        'Open Source! Always Free! ' +
        '<a href="https://github.com/datalackey/fill-form-bookmarklet" target="_blank" rel="noopener">' +
        "https://github.com/datalackey/fill-form-bookmarklet" +
        "</a>" +
        "</div>";
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
