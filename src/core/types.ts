/** Output of detectLabel(): the resolved label text and which pattern (0–3b) produced it. */
export interface LabelResult {
    text: string;
    pattern: number | string;
}

/**
 * One discovered form field with a `name` attribute. Shared by both modes:
 * Scan builds these to display and serialize the template; Fill uses them to
 * match against the clipboard template and write values into the live DOM.
 */
export interface FormField {
    name: string;
    label: string;
    labelPattern: number | string;
    value: string;
    element: HTMLElement;
    groupLabel: string | null;
}

/**
 * The flat name→value map that the user saves to a text file and pastes into
 * the clipboard. Scan produces it; Fill consumes it. Keys are field `name`
 * attributes; values are strings for all input types.
 */
export interface Template {
    [key: string]: string;
}

/**
 * Three-way classification produced by matchFields() at the start of Fill mode:
 *   willFill          — template key matches a page field; value will be written
 *   noMatchOnPage     — template key has no field on this page (stale entry)
 *   noValueInTemplate — page field has no template entry; left untouched
 * Zero willFill entries → "Nothing to Fill" overlay; the template is from a different form.
 */
export interface MatchResult {
    willFill: FormField[];
    noMatchOnPage: string[];
    noValueInTemplate: FormField[];
}

/**
 * Everything the Scan overlay needs: the discovered fields for the table,
 * the parsed template for reference, and templateText (pre-serialized JSON)
 * for the "Copy Template to Clipboard" button.
 */
export interface ScanViewModel {
    fields: FormField[];
    template: Template;
    templateText: string;
}

/**
 * Everything the Fill overlay needs: the three-way match result for display,
 * and the template so the overlay can show values being filled and — on a
 * zero-match mismatch — render the clipboard contents for the user to inspect.
 */
export interface FillViewModel {
    result: MatchResult;
    template: Template;
}
