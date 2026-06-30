import { discoverFields } from "../dom/dom.js";
import { readClipboard, parseTemplate } from "../clipboard/clipboard.js";
import { FormField, MatchResult, Template } from "../types/types.js";

/**
 * Three-way match between a template and the form on the page:
 *   - willFill:          fields whose `name` has a value in the template
 *   - noMatchOnPage:     template keys with no corresponding field (stale)
 *   - noValueInTemplate: page fields with no template entry
 */
export function matchFields(template: Template, fields: FormField[]): MatchResult {
    const willFill: FormField[] = [];
    const noValueInTemplate: FormField[] = [];
    const matchedKeys = new Set<string>();

    for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(template, field.name)) {
            willFill.push(field);
            matchedKeys.add(field.name);
        } else {
            noValueInTemplate.push(field);
        }
    }

    const noMatchOnPage: string[] = [];
    for (const key of Object.keys(template)) {
        if (!matchedKeys.has(key)) {
            noMatchOnPage.push(key);
        }
    }

    return {
        willFill: willFill,
        noMatchOnPage: noMatchOnPage,
        noValueInTemplate: noValueInTemplate,
    };
}

/**
 * Apply a single value to a field and fire the events frameworks listen for.
 * TODO: checkbox (checked = value === "true" | "on") and select (selectedIndex)
 * handling per CLAUDE.md.
 */
export function fillField(field: FormField, value: string): void {
    const element = field.element as HTMLInputElement;
    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Fill-mode entry point. Reads the clipboard; if it holds a valid template,
 * returns the three-way match against the current page. Returns null when there
 * is no template on the clipboard, signalling the orchestrator to scan instead.
 */
export async function runFill(): Promise<MatchResult | null> {
    const raw = await readClipboard();
    const template = parseTemplate(raw);
    if (template === null) {
        return null;
    }
    return matchFields(template, discoverFields());
}
