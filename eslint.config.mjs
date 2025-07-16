import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        apiService: true,
        meact: true,
      },
    },
    plugins: { js },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
]);
