import { discoverFields } from "../core/dom.js";
import { serializeTemplate } from "../core/clipboard.js";
import { FormField, ScanViewModel, Template } from "../core/types.js";

/** Build a flat name -> value template from discovered fields. */
export function buildTemplate(fields: FormField[]): Template {
    const template: Template = {};
    for (const field of fields) {
        template[field.name] = field.value;
    }
    return template;
}

/**
 * Produce the Scan-mode view model: the discovered fields (with current values
 * and group labels) and the JSON template text the user copies and saves.
 */
export function buildScanViewModel(): ScanViewModel {
    const fields = discoverFields();
    const template = buildTemplate(fields);
    return {
        fields: fields,
        template: template,
        templateText: serializeTemplate(template),
    };
}
