import { describe, it, expect } from "vitest";
import { renderFillView } from "../src/app/overlay.js";
import { FillViewModel, FormField } from "../src/core/types.js";

function makeField(name: string, label: string): FormField {
    return {
        name: name,
        label: label,
        labelPattern: 1,
        value: "",
        element: document.createElement("input"),
        groupLabel: null,
    };
}

describe("renderFillView — Nothing to Fill", function () {
    const vm: FillViewModel = {
        result: {
            willFill: [],
            noMatchOnPage: ["event_title", "event_date"],
            noValueInTemplate: [],
        },
        template: { event_title: "Peace Meeting", event_date: "2026-03-01" },
    };
    const html = renderFillView(vm);

    it("shows the Nothing to Fill heading", function () {
        expect(html).toContain("Nothing to Fill");
    });

    it("shows the Template found in clipboard label", function () {
        expect(html).toContain("Template found in clipboard");
    });

    it("renders the clipboard template JSON", function () {
        expect(html).toContain("event_title");
        expect(html).toContain("Peace Meeting");
        expect(html).toContain("event_date");
        expect(html).toContain("2026-03-01");
    });

    it("includes the Close button", function () {
        expect(html).toContain("ffb-fill-cancel-btn");
        expect(html).toContain("Close");
    });

    it("includes the Scan this form instead button", function () {
        expect(html).toContain("ffb-scan-instead-btn");
        expect(html).toContain("Scan this form instead");
    });

    it("does not include the Fill Form button", function () {
        expect(html).not.toContain("ffb-fill-btn");
    });
});

describe("renderFillView — Ready to Fill", function () {
    const field = makeField("event_title", "Event Title");
    const vm: FillViewModel = {
        result: {
            willFill: [field],
            noMatchOnPage: [],
            noValueInTemplate: [],
        },
        template: { event_title: "Peace Meeting" },
    };
    const html = renderFillView(vm);

    it("shows the Ready to Fill heading", function () {
        expect(html).toContain("Ready to Fill");
    });

    it("includes the Fill Form button", function () {
        expect(html).toContain("ffb-fill-btn");
        expect(html).toContain("Fill Form");
    });

    it("includes the Cancel button", function () {
        expect(html).toContain("ffb-fill-cancel-btn");
        expect(html).toContain("Cancel");
    });

    it("includes the Scan this form instead button", function () {
        expect(html).toContain("ffb-scan-instead-btn");
        expect(html).toContain("Scan this form instead");
    });

    it("does not show Template found in clipboard section", function () {
        expect(html).not.toContain("Template found in clipboard");
    });
});
