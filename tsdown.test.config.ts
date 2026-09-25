import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: false,
  entry: ["tests/*.test.ts"],
  format: ["esm"],
  outDir: ".test-dist",
  target: "esnext",
});
