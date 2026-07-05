import { describe, it, expect, beforeEach } from "vitest";
import { FormField } from "../src/core/types.js";
import { buildTemplate, buildScanViewModel } from "../src/scan/scan.js";

function makeField(name: string, value: string): FormField {
    return {
        name: name,
        label: "",
        labelPattern: 1,
        value: value,
        element: document.createElement("input"),
        groupLabel: null,
    };
}

describe("buildTemplate", function () {
    it("returns an empty object for an empty fields array", function () {
        expect(buildTemplate([])).toEqual({});
    });

    it("maps a single field name to its value", function () {
        expect(buildTemplate([makeField("event_title", "Peace Meeting")])).toEqual({
            event_title: "Peace Meeting",
        });
    });

    it("maps multiple fields by name", function () {
        const fields = [
            makeField("event_title", "Peace Meeting"),
            makeField("event_date", "2026-03-15"),
            makeField("contact_email", "org@example.com"),
        ];
        expect(buildTemplate(fields)).toEqual({
            event_title: "Peace Meeting",
            event_date: "2026-03-15",
            contact_email: "org@example.com",
        });
    });

    it("preserves empty string values as present keys", function () {
        const template = buildTemplate([
            makeField("event_title", ""),
            makeField("event_date", "2026-03-15"),
        ]);
        expect(Object.prototype.hasOwnProperty.call(template, "event_title")).toBe(true);
        expect(template["event_title"]).toBe("");
    });
});

describe("buildScanViewModel", function () {
    beforeEach(function () {
        document.body.innerHTML = "";
    });

    it("returns empty fields and template when no named inputs exist", function () {
        const vm = buildScanViewModel();
        expect(vm.fields).toHaveLength(0);
        expect(vm.template).toEqual({});
    });

    it("includes the discovered field in both fields array and template", function () {
        const input = document.createElement("input");
        input.name = "event_title";
        input.value = "Community Garden";
        document.body.appendChild(input);

        const vm = buildScanViewModel();
        expect(vm.fields).toHaveLength(1);
        expect(vm.fields[0].name).toBe("event_title");
        expect(vm.template).toEqual({ event_title: "Community Garden" });
    });

    it("templateText is valid JSON that round-trips to the template", function () {
        const input = document.createElement("input");
        input.name = "event_title";
        input.value = "Community Garden";
        document.body.appendChild(input);

        const vm = buildScanViewModel();
        expect(JSON.parse(vm.templateText)).toEqual(vm.template);
    });
});
