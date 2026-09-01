import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default [
  { ignores: ["node_modules"] },
  {
    ...js.configs.recommended,
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: globals.node,
    },
  },
  eslintPluginPrettier,
];
