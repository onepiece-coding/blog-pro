import { defineConfig } from "vite";

import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tsconfigPaths(),
    svgr(),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./setupTests.ts",
  },
});
