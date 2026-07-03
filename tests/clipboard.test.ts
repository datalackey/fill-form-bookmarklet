import { describe, it, expect } from "vitest";
import { looksLikeJson, parseTemplate, serializeTemplate } from "../src/core/clipboard.js";

describe("looksLikeJson", () => {
    it("returns false for empty string", () => {
        expect(looksLikeJson("")).toBe(false);
    });

    it("returns false for whitespace only", () => {
        expect(looksLikeJson("   \n")).toBe(false);
    });

    it("returns false for plain text", () => {
        expect(looksLikeJson("hello world")).toBe(false);
    });

    it("returns false for a JSON array", () => {
        expect(looksLikeJson("[1, 2, 3]")).toBe(false);
    });

    it("returns true for a bare opening brace", () => {
        expect(looksLikeJson("{")).toBe(true);
    });

    it("returns true for an unclosed JSON object", () => {
        expect(looksLikeJson('{"event_title": "Community Garden Party')).toBe(true);
    });

    it("returns true for a valid JSON object", () => {
        expect(looksLikeJson('{"a": "b"}')).toBe(true);
    });

    it("returns true when preceded by whitespace", () => {
        expect(looksLikeJson('  {"a": "b"}')).toBe(true);
    });
});

describe("parseTemplate", () => {
    it("returns null for empty string", () => {
        expect(parseTemplate("")).toBeNull();
    });

    it("returns null for whitespace only", () => {
        expect(parseTemplate("   ")).toBeNull();
    });

    it("returns null for malformed JSON", () => {
        expect(parseTemplate('{"a": "b"')).toBeNull();
    });

    it("returns null for a JSON array", () => {
        expect(parseTemplate("[1, 2]")).toBeNull();
    });

    it("returns null for a JSON null literal", () => {
        expect(parseTemplate("null")).toBeNull();
    });

    it("parses a flat string-valued object", () => {
        expect(parseTemplate('{"name": "Alice", "email": "a@example.com"}')).toEqual({
            name: "Alice",
            email: "a@example.com",
        });
    });

    it("coerces non-string values to string", () => {
        expect(parseTemplate('{"count": 3}')).toEqual({ count: "3" });
    });
});

describe("serializeTemplate", () => {
    it("produces valid JSON that round-trips", () => {
        const template = { name: "Alice", city: "San Jose" };
        const result = serializeTemplate(template);
        expect(JSON.parse(result)).toEqual(template);
    });

    it("produces indented output", () => {
        const result = serializeTemplate({ a: "1" });
        expect(result).toContain("\n");
    });
});
