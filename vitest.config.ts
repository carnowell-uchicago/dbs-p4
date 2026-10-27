import { defineConfig } from "vitest/config";

// Unit tests only. Playwright E2E tests (e2e/ or tests/e2e/) run separately,
// so Vitest only picks up *.test.ts files under src/.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
