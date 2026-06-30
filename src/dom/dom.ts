import { FormField, LabelResult } from "../types/types.js";

// Ported from spike/scan-spike.js — field discovery and four-pattern label
// detection, validated against test-server/. Known carry-forward issues from
// the spike are marked TODO below (radio group labels; child-span stripping).

const FORM_CONTROL_SELECTOR = "input, select, textarea";

function firstLine(text: string | null): string {
    if (text === null) {
        return "";
    }
    return text.trim().split("\n")[0].trim();
}

/**
 * Detect a field's human-readable label using four patterns, in priority order:
 *   1. <label for="el.id">                 — formal association
 *   2. field is a descendant of <label>    — wrapping label
 *   3. nearest preceding sibling <label>    — heuristic
 *   3b. parent container's preceding sibling is <label> (CalendarWiz div style)
 * Returns { text: "", pattern: 0 } when nothing is found (e.g. hidden fields).
 */
export function detectLabel(el: HTMLElement): LabelResult {
    // Pattern 1: <label for="id">
    if (el.id !== "") {
        const forLabel = document.querySelector('label[for="' + el.id + '"]');
        if (forLabel !== null) {
            return { text: firstLine(forLabel.textContent), pattern: 1 };
        }
    }

    // Pattern 2: field wrapped inside a <label>
    let parent = el.parentElement;
    while (parent !== null) {
        if (parent.tagName === "LABEL") {
            return { text: firstLine(parent.textContent), pattern: 2 };
        }
        parent = parent.parentElement;
    }

    // Pattern 3: nearest preceding sibling <label>
    let sibling = el.previousElementSibling;
    while (sibling !== null) {
        if (sibling.tagName === "LABEL") {
            return { text: firstLine(sibling.textContent), pattern: 3 };
        }
        sibling = sibling.previousElementSibling;
    }

    // Pattern 3b: parent container's preceding sibling is a <label>
    const container = el.parentElement;
    if (container !== null) {
        let containerSibling = container.previousElementSibling;
        while (containerSibling !== null) {
            if (containerSibling.tagName === "LABEL") {
                return { text: firstLine(containerSibling.textContent), pattern: "3b" };
            }
            containerSibling = containerSibling.previousElementSibling;
        }
    }

    return { text: "", pattern: 0 };
}

function isSubmitLike(el: HTMLElement): boolean {
    if (el.tagName !== "INPUT") {
        return false;
    }
    const type = (el as HTMLInputElement).type.toLowerCase();
    return type === "submit" || type === "button";
}

function readValue(el: HTMLElement): string {
    // input, select, and textarea all expose a string `value` property.
    return (el as HTMLInputElement).value;
}

/**
 * Discover every form control that has a non-empty `name` attribute. Only
 * `name` fields are sent in the POST, so `id`-only controls are ignored.
 * Submit/button inputs are excluded. Hidden fields ARE included (shown to the
 * user for awareness) but must never be overwritten during fill.
 */
export function discoverFields(): FormField[] {
    const elements = Array.prototype.slice.call(
        document.querySelectorAll(FORM_CONTROL_SELECTOR)
    ) as HTMLElement[];

    const fields: FormField[] = [];
    for (const el of elements) {
        const name = el.getAttribute("name");
        if (name === null || name === "") {
            continue;
        }
        if (isSubmitLike(el)) {
            continue;
        }
        const labelResult = detectLabel(el);
        fields.push({
            name: name,
            label: labelResult.text,
            labelPattern: labelResult.pattern,
            value: readValue(el),
            element: el,
            groupLabel: null,
        });
    }

    return detectGroups(fields);
}

/**
 * Cluster fields that share an identical detected label (e.g. the month/day/year
 * selects that all resolve to "Start Date"). Fields whose label is shared by at
 * least one other field get that label as their `groupLabel`; singletons get null.
 *
 * TODO (spike carry-forward): radio groups currently surface each option's own
 * wrapping-label text ("Public" / "Private") rather than the shared group label.
 */
export function detectGroups(fields: FormField[]): FormField[] {
    const labelCounts = new Map<string, number>();
    for (const field of fields) {
        if (field.label === "") {
            continue;
        }
        labelCounts.set(field.label, (labelCounts.get(field.label) ?? 0) + 1);
    }

    return fields.map(function (field) {
        const count = labelCounts.get(field.label) ?? 0;
        return {
            name: field.name,
            label: field.label,
            labelPattern: field.labelPattern,
            value: field.value,
            element: field.element,
            groupLabel: count > 1 ? field.label : null,
        };
    });
}
