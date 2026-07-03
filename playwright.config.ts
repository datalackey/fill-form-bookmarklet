import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "tests/e2e",
    timeout: 15_000,
    use: {
        browserName: "chromium",
        headless: true,
        baseURL: "http://localhost:3456",
    },
    webServer: {
        command: "node test-server/server.js",
        url: "http://localhost:3456",
        reuseExistingServer: true,
    },
});
