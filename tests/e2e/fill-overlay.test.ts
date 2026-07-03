import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOKMARKLET = fs.readFileSync(
    path.resolve(__dirname, "../../dist/bookmarklet.dev.js"),
    "utf-8"
);

async function grantClipboard(context: BrowserContext): Promise<void> {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
}

async function setClipboard(page: Page, text: string): Promise<void> {
    await page.evaluate((t: string) => navigator.clipboard.writeText(t), text);
}

async function inject(page: Page): Promise<void> {
    await page.evaluate(BOOKMARKLET);
}

test.describe("Fill overlay — malformed JSON", () => {
    test.beforeEach(async ({ page, context }) => {
        await page.goto("/");
        await grantClipboard(context);
    });

    test("shows error overlay when clipboard looks like JSON but is malformed", async ({
        page,
    }) => {
        await setClipboard(page, '{"event_title": "Community Garden Party"');
        await inject(page);
        await expect(page.locator("#ffb-overlay")).toBeVisible();
        await expect(page.locator("#ffb-overlay")).toContainText("Template Error");
        await expect(page.locator("#ffb-overlay")).toContainText("could not be parsed");
    });

    test("bare opening brace triggers error overlay, not scan", async ({ page }) => {
        await setClipboard(page, "{");
        await inject(page);
        await expect(page.locator("#ffb-overlay")).toContainText("Template Error");
        await expect(page.locator("#ffb-copy-btn")).not.toBeAttached();
    });

    test("close button dismisses error overlay", async ({ page }) => {
        await setClipboard(page, '{"broken":');
        await inject(page);
        await page.locator("#ffb-error-cancel-btn").click();
        await expect(page.locator("#ffb-overlay")).not.toBeAttached();
    });

    test("Escape dismisses error overlay", async ({ page }) => {
        await setClipboard(page, '{"broken":');
        await inject(page);
        await page.keyboard.press("Escape");
        await expect(page.locator("#ffb-overlay")).not.toBeAttached();
    });
});

test.describe("Fill overlay — valid template", () => {
    // Use two simple text fields present in the test form (pattern 1 labels)
    const TEMPLATE = JSON.stringify({
        g2_text: "Test Event Name",
        g2_email: "test@example.com",
    });

    test.beforeEach(async ({ page, context }) => {
        await page.goto("/");
        await grantClipboard(context);
        await setClipboard(page, TEMPLATE);
    });

    test("shows fill overlay with Fill Form button", async ({ page }) => {
        await inject(page);
        await expect(page.locator("#ffb-overlay")).toBeVisible();
        await expect(page.locator("#ffb-overlay")).toContainText("Ready to Fill");
        await expect(page.locator("#ffb-fill-btn")).toBeVisible();
        await expect(page.locator("#ffb-fill-btn")).toContainText("Fill Form");
        await expect(page.locator("#ffb-fill-cancel-btn")).toBeVisible();
    });

    test("overlay table lists matched field names and template values", async ({ page }) => {
        await inject(page);
        await expect(page.locator("#ffb-overlay")).toContainText("g2_text");
        await expect(page.locator("#ffb-overlay")).toContainText("g2_email");
        await expect(page.locator("#ffb-overlay")).toContainText("Test Event Name");
        await expect(page.locator("#ffb-overlay")).toContainText("test@example.com");
    });

    test("cancel button dismisses fill overlay without filling", async ({ page }) => {
        await inject(page);
        await page.locator("#ffb-fill-cancel-btn").click();
        await expect(page.locator("#ffb-overlay")).not.toBeAttached();
        await expect(page.locator('[name="g2_text"]')).toHaveValue("");
    });

    test("Escape dismisses fill overlay without filling", async ({ page }) => {
        await inject(page);
        await page.keyboard.press("Escape");
        await expect(page.locator("#ffb-overlay")).not.toBeAttached();
        await expect(page.locator('[name="g2_text"]')).toHaveValue("");
    });

    test("Fill Form fills matched fields and closes overlay", async ({ page }) => {
        await inject(page);
        await page.locator("#ffb-fill-btn").click();
        await expect(page.locator("#ffb-overlay")).not.toBeAttached();
        await expect(page.locator('[name="g2_text"]')).toHaveValue("Test Event Name");
        await expect(page.locator('[name="g2_email"]')).toHaveValue("test@example.com");
    });
});
