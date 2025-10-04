import { defineConfig, Options } from "tsup";

const config: Options = {
  entry: ["src/index.ts", "src/cli/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  platform: "node",
  dts: true,
  shims: true,
};

export default defineConfig(config);
