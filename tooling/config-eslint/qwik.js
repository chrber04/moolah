import baseConfig from "./base.js";
import { qwikEslint9Plugin } from "eslint-plugin-qwik";
import tseslint from "@typescript-eslint/eslint-plugin";
import { qwikRules } from "./rules/qwik.js";

const GLOB_INCLUDE = ["**/*.{ts,tsx}"];

export default [
  ...baseConfig,
  ...qwikEslint9Plugin.configs.recommended,
  {
    name: "moolah/qwik",
    files: GLOB_INCLUDE,
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
      },
    },
    rules: qwikRules,
  },
];
