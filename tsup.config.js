import { defineConfig } from "tsup";

export default defineConfig({
  splitting: false,
  sourcemap: true,
  clean: true,
  format: "cjs",
  target: "es2022",
  platform: "node",
  shims: true,
});
