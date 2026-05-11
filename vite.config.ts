import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const coreSrc = fileURLToPath(new URL("../shader-gen-core/src", import.meta.url));

export default defineConfig({
  base: process.env.PUBLIC_BASE ?? "/shader-gen-playground/",
  resolve: {
    alias: {
      "@phpolygon/shader-gen-core": `${coreSrc}/index.ts`,
      "@phpolygon/shader-gen-core/": `${coreSrc}/`,
    },
  },
  server: {
    fs: {
      allow: ["..", coreSrc],
    },
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
