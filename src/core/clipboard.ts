import { Template } from "./types.js";

/**
 * Read the clipboard as text. Returns "" when the clipboard API is unavailable
 * or read permission is denied — Scan mode is the safe fallback in that case.
 */
export async function readClipboard(): Promise<string> {
    if (typeof navigator.clipboard === "undefined") {
        return "";
    }
    try {
        return await navigator.clipboard.readText();
    } catch {
        return "";
    }
}

/**
 * Parse clipboard text into a flat name -> value template. Returns null when the
 * text is empty or not a valid flat JSON object, which the orchestrator treats
 * as "not a template" and falls back to Scan mode.
 *
 * TODO: YAML is a candidate format for the same flat name -> value shape.
 */
export function parseTemplate(raw: string): Template | null {
    if (raw.trim().length === 0) {
        return null;
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
    }
    const template: Template = {};
    for (const [key, value] of Object.entries(parsed)) {
        template[key] = typeof value === "string" ? value : String(value);
    }
    return template;
}

/** Serialize a template to the JSON text the user saves and later edits. */
export function serializeTemplate(template: Template): string {
    return JSON.stringify(template, null, 2);
}
