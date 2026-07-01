import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { discoverFields, detectLabel } from "../src/core/dom.js";
import { FormField } from "../src/core/types.js";

const here = dirname(fileURLToPath(import.meta.url));
const formHtml = readFileSync(resolve(here, "fixtures/scan-form.html"), "utf-8");

beforeEach(function () {
    document.body.innerHTML = formHtml;
});

function field(fields: FormField[], name: string): FormField {
    const found = fields.find(function (f) {
        return f.name === name;
    });
    if (found === undefined) {
        throw new Error("no field discovered with name=" + name);
    }
    return found;
}

describe("discoverFields", function () {
    it("discovers every named control and skips the submit button", function () {
        const names = discoverFields().map(function (f) {
            return f.name;
        });
        // 4 + 2 + 2 + 3 radios + 3 hidden + 6 + 1 = 21
        expect(names).toHaveLength(21);
        expect(names).toContain("g1_text");
        expect(names).not.toContain("submit");
    });

    it("includes hidden fields so the user sees them in the scan", function () {
        const hidden = field(discoverFields(), "g5_calendar_id");
        expect(hidden.value).toBe("97241");
        expect(hidden.label).toBe("");
        expect(hidden.labelPattern).toBe(0);
    });

    it("reads the current value of inputs and selected option of selects", function () {
        const fields = discoverFields();
        expect(field(fields, "g1_text").value).toBe("hello");
        expect(field(fields, "g1_select").value).toBe("alpha");
        expect(field(fields, "g6_startmonth").value).toBe("6");
        expect(field(fields, "g6_startyear").value).toBe("2026");
        expect(field(fields, "g6_startampm").value).toBe("pm");
    });
});

describe("detectLabel — four patterns (spike confirmed findings)", function () {
    interface Case {
        name: string;
        label: string;
        pattern: number | string;
    }

    const cases: Case[] = [
        { name: "g1_text", label: "Text", pattern: 2 }, // wrapped in <label>
        { name: "g1_select", label: "Select", pattern: 2 },
        { name: "g2_text", label: "Text", pattern: 1 }, // <label for="id">
        { name: "g2_email", label: "Email", pattern: 1 },
        { name: "g3_fullname", label: "Full Name", pattern: 3 }, // preceding sibling
        { name: "g3_email", label: "Email Address", pattern: 3 },
        { name: "g6_startmonth", label: "Start Date", pattern: "3b" }, // container sibling
        { name: "g6_starthour", label: "Start Time", pattern: "3b" },
        { name: "g7_name_text", label: "Text", pattern: 2 },
        { name: "g5_calendar_id", label: "", pattern: 0 }, // hidden: no label
    ];

    for (const c of cases) {
        it("labels " + c.name + ' as "' + c.label + '" via pattern ' + c.pattern, function () {
            const el = field(discoverFields(), c.name).element;
            const result = detectLabel(el);
            expect(result.text).toBe(c.label);
            expect(result.pattern).toBe(c.pattern);
        });
    }

    it("strips trailing annotation-span text via first-line heuristic", function () {
        // g1_text's <label> also contains a <span class="attr-note"> on a later
        // line; the detected label must be just "Text".
        const el = field(discoverFields(), "g1_text").element;
        expect(detectLabel(el).text).toBe("Text");
    });
});

describe("detectGroups", function () {
    it("clusters the date selects under a shared group label", function () {
        const fields = discoverFields();
        expect(field(fields, "g6_startmonth").groupLabel).toBe("Start Date");
        expect(field(fields, "g6_startday").groupLabel).toBe("Start Date");
        expect(field(fields, "g6_startyear").groupLabel).toBe("Start Date");
        expect(field(fields, "g6_starthour").groupLabel).toBe("Start Time");
    });

    it("leaves a field with a unique label ungrouped", function () {
        expect(field(discoverFields(), "g3_fullname").groupLabel).toBeNull();
    });

    // Known spike carry-forward: each radio currently reports its own wrapping
    // label ("Public"/"Private") instead of the shared "Event visibility" group
    // label. Locked as TODO until dom.ts implements radio-group handling.
    it.todo("radio group should use the shared name label, not per-option text");
});
