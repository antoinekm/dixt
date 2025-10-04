import { defineConfig, Options } from "tsup";

const config: Options = {
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  platform: "node",
  dts: true,
  format: ["cjs"],
  outExtension: () => ({ js: ".js" }),
};

export default defineConfig(config);
