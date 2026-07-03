import { MatchResult, ScanViewModel } from "../core/types.js";

const OVERLAY_ID = "ffb-overlay";

function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Render the Scan-mode view: field/label/value table + copyable template. */
export function renderScanView(model: ScanViewModel): string {
    const rows = model.fields
        .map(function (field) {
            const group = field.groupLabel === null ? "" : field.groupLabel;
            return (
                "<tr><td>" +
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
        "<h2>Scan</h2><table><thead><tr><th>name</th><th>label</th>" +
        "<th>value</th><th>group</th></tr></thead><tbody>" +
        rows +
        "</tbody></table><pre>" +
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
    container.style.padding = "12px";
    container.innerHTML = html;
    document.body.appendChild(container);
}

/** Remove the bookmarklet overlay from the page if it is present. */
export function closeOverlay(): void {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing !== null) {
        existing.remove();
    }
}
