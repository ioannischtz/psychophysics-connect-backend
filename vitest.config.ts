import tsconfigPaths from "vite-tsconfig-paths";
import { viteRequire } from "vite-require";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
    ],
    useAtomics: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json"],
      reportOnFailure: true,
    },
    silent: false,
    setupFiles: "tests/setup.ts",
    mockReset: true,
  },
  esbuild: {
    target: "esnext",
    platform: "node",
    format: "esm",
  },
  plugins: [tsconfigPaths(), viteRequire()],
});
