import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOKMARKLET = fs.readFileSync(
    path.resolve(__dirname, "../../dist/bookmarklet.dev.js"),
    "utf-8"
);

async function setupClipboard(context: BrowserContext, page: Page): Promise<void> {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    // Ensure scan mode: empty clipboard means readClipboard() returns "",
    // parseTemplate("") returns null, orchestrator falls through to showScanOverlay.
    await page.evaluate(() => navigator.clipboard.writeText(""));
}

async function inject(page: Page): Promise<void> {
    await page.evaluate(BOOKMARKLET);
}

test.describe("Scan overlay", () => {
    test.beforeEach(async ({ page, context }) => {
        await page.goto("/");
        await setupClipboard(context, page);
    });

    test("overlay appears with copy and cancel buttons", async ({ page }) => {
        await inject(page);
        await expect(page.locator("#ffb-overlay")).toBeVisible();
        await expect(page.locator("#ffb-copy-btn")).toBeVisible();
        await expect(page.locator("#ffb-cancel-btn")).toBeVisible();
        await expect(page.locator("#ffb-copy-confirm")).not.toBeVisible();
    });

    test("cancel button dismisses overlay immediately", async ({ page }) => {
        await inject(page);
        await page.locator("#ffb-cancel-btn").click();
        await expect(page.locator("#ffb-overlay")).not.toBeAttached();
    });

    test("escape key dismisses overlay", async ({ page }) => {
        await inject(page);
        await page.keyboard.press("Escape");
        await expect(page.locator("#ffb-overlay")).not.toBeAttached();
    });

    test("copy button: confirmation shown, clipboard has JSON, overlay auto-dismisses", async ({
        page,
    }) => {
        await page.clock.install();
        await inject(page);

        await page.locator("#ffb-copy-btn").click();

        // Buttons hide, green confirmation appears
        await expect(page.locator("#ffb-copy-btn")).not.toBeVisible();
        await expect(page.locator("#ffb-cancel-btn")).not.toBeVisible();
        await expect(page.locator("#ffb-copy-confirm")).toBeVisible();
        await expect(page.locator("#ffb-copy-confirm")).toContainText("Copied!");
        await expect(page.locator("#ffb-copy-confirm")).toContainText("press Submit");

        // Clipboard holds valid JSON with at least one field key
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        const parsed: unknown = JSON.parse(clipboardText);
        expect(parsed !== null && typeof parsed === "object").toBe(true);
        expect(Object.keys(parsed as object).length).toBeGreaterThan(0);

        // Auto-dismiss after 4 seconds
        await page.clock.fastForward(4000);
        await expect(page.locator("#ffb-overlay")).not.toBeAttached();
    });

    test("copy failure: button shows error, overlay stays open for manual copy", async ({
        page,
    }) => {
        await inject(page);

        // Simulate clipboard permission denied after overlay is visible
        await page.evaluate(() => {
            navigator.clipboard.writeText = (): Promise<void> =>
                Promise.reject(new Error("NotAllowedError"));
        });

        await page.locator("#ffb-copy-btn").click();

        await expect(page.locator("#ffb-copy-btn")).toContainText("Copy failed");
        await expect(page.locator("#ffb-overlay")).toBeVisible();
        // Confirmation message should NOT appear on failure
        await expect(page.locator("#ffb-copy-confirm")).not.toBeVisible();
    });
});
