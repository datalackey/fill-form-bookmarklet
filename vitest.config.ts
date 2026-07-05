import { defineConfig, type Plugin } from "vitest/config";
import { readFileSync } from "node:fs";

const cssAsText: Plugin = {
    name: "css-as-text",
    transform(_code: string, id: string) {
        if (id.endsWith(".css")) {
            return { code: "export default " + JSON.stringify(readFileSync(id, "utf-8")) };
        }
    },
};

export default defineConfig({
    plugins: [cssAsText],
    test: {
        environment: "jsdom",
        globals: true,
        include: ["tests/**/*.test.ts"],
        exclude: ["tests/e2e/**"],
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
            exclude: ["src/index.ts", "src/overlay.ts"],
        },
    },
});
