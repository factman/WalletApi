import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.spec.ts",
        "src/**/*.test.ts",
        "src/index.ts",
        "src/**/types.ts",
        "src/**/constants.ts",
        "db/**/*.ts",
        "knexfile.ts",
        "src/configs/*.ts",
        "src/models/*.ts",
        "src/router/*.ts",
        "src/**/router.ts",
      ],
    },
  },
  plugins: [tsconfigPaths()],
});
