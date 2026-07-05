import { describe, it, expect, beforeEach } from "vitest";
import { FormField } from "../src/core/types.js";
import { matchFields, fillField, applyFill, runFill } from "../src/fill/fill.js";

function makeField(name: string, value: string = ""): FormField {
    return {
        name: name,
        label: "",
        labelPattern: 1,
        value: value,
        element: document.createElement("input"),
        groupLabel: null,
    };
}

describe("matchFields", function () {
    it("returns all-empty result for empty template and empty fields", function () {
        const result = matchFields({}, []);
        expect(result.willFill).toHaveLength(0);
        expect(result.noMatchOnPage).toHaveLength(0);
        expect(result.noValueInTemplate).toHaveLength(0);
    });

    it("puts a field in willFill when its name is in the template", function () {
        const result = matchFields({ event_title: "Peace Meeting" }, [makeField("event_title")]);
        expect(result.willFill).toHaveLength(1);
        expect(result.willFill[0].name).toBe("event_title");
        expect(result.noMatchOnPage).toHaveLength(0);
        expect(result.noValueInTemplate).toHaveLength(0);
    });

    it("puts a template key in noMatchOnPage when no page field matches", function () {
        const result = matchFields({ stale_key: "old value" }, []);
        expect(result.noMatchOnPage).toEqual(["stale_key"]);
        expect(result.willFill).toHaveLength(0);
    });

    it("puts a field in noValueInTemplate when its name is absent from the template", function () {
        const result = matchFields({}, [makeField("unmapped_field")]);
        expect(result.noValueInTemplate).toHaveLength(1);
        expect(result.noValueInTemplate[0].name).toBe("unmapped_field");
        expect(result.willFill).toHaveLength(0);
    });

    it("classifies a mixed set of fields correctly", function () {
        const fields = [makeField("event_title"), makeField("unmapped_field")];
        const template = { event_title: "Peace Meeting", stale_key: "old value" };
        const result = matchFields(template, fields);
        expect(
            result.willFill.map(function (f) {
                return f.name;
            })
        ).toEqual(["event_title"]);
        expect(result.noMatchOnPage).toEqual(["stale_key"]);
        expect(
            result.noValueInTemplate.map(function (f) {
                return f.name;
            })
        ).toEqual(["unmapped_field"]);
    });

    it("preserves field order in willFill", function () {
        const fields = [makeField("a"), makeField("b"), makeField("c")];
        const result = matchFields({ a: "1", b: "2", c: "3" }, fields);
        expect(
            result.willFill.map(function (f) {
                return f.name;
            })
        ).toEqual(["a", "b", "c"]);
    });
});

describe("fillField", function () {
    it("sets the element value", function () {
        const f = makeField("event_title");
        fillField(f, "Peace Meeting");
        expect((f.element as HTMLInputElement).value).toBe("Peace Meeting");
    });

    it("dispatches an input event that bubbles", function () {
        const f = makeField("event_title");
        let inputBubbles = false;
        f.element.addEventListener("input", function (e) {
            inputBubbles = e.bubbles;
        });
        fillField(f, "Peace Meeting");
        expect(inputBubbles).toBe(true);
    });

    it("dispatches a change event that bubbles", function () {
        const f = makeField("event_title");
        let changeBubbles = false;
        f.element.addEventListener("change", function (e) {
            changeBubbles = e.bubbles;
        });
        fillField(f, "Peace Meeting");
        expect(changeBubbles).toBe(true);
    });
});

describe("applyFill", function () {
    it("writes template values into all willFill elements", function () {
        const titleField = makeField("event_title");
        const emailField = makeField("contact_email");
        applyFill({
            result: {
                willFill: [titleField, emailField],
                noMatchOnPage: [],
                noValueInTemplate: [],
            },
            template: { event_title: "Peace Meeting", contact_email: "org@example.com" },
        });
        expect((titleField.element as HTMLInputElement).value).toBe("Peace Meeting");
        expect((emailField.element as HTMLInputElement).value).toBe("org@example.com");
    });

    it("does not modify elements in noValueInTemplate", function () {
        const unmappedField = makeField("unmapped");
        (unmappedField.element as HTMLInputElement).value = "original";
        applyFill({
            result: {
                willFill: [],
                noMatchOnPage: [],
                noValueInTemplate: [unmappedField],
            },
            template: {},
        });
        expect((unmappedField.element as HTMLInputElement).value).toBe("original");
    });
});

describe("runFill", function () {
    beforeEach(function () {
        document.body.innerHTML = "";
    });

    it("returns null for an empty string", function () {
        expect(runFill("")).toBeNull();
    });

    it("returns null for malformed JSON", function () {
        expect(runFill('{"event_title": "Community Garden Party"')).toBeNull();
    });

    it("returns null for plain text", function () {
        expect(runFill("not json at all")).toBeNull();
    });

    it("returns a FillViewModel with the matched field in willFill", function () {
        const input = document.createElement("input");
        input.name = "event_title";
        document.body.appendChild(input);

        const vm = runFill('{"event_title": "Peace Meeting"}');
        expect(vm).not.toBeNull();
        expect(vm!.template).toEqual({ event_title: "Peace Meeting" });
        expect(vm!.result.willFill).toHaveLength(1);
        expect(vm!.result.willFill[0].name).toBe("event_title");
    });

    it("returns a FillViewModel with stale key in noMatchOnPage when no field matches", function () {
        const vm = runFill('{"stale_key": "old value"}');
        expect(vm).not.toBeNull();
        expect(vm!.result.willFill).toHaveLength(0);
        expect(vm!.result.noMatchOnPage).toContain("stale_key");
    });
});
