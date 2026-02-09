import js from "@eslint/js";
import ts from "typescript-eslint";
import globals from "globals";
import configPrettier from "eslint-config-prettier";
import configTurbo from "eslint-config-turbo/flat";
import pluginStylistic from "@stylistic/eslint-plugin";
import pluginNode from "eslint-plugin-n";
import pluginImport from "eslint-plugin-import-x";
import {
  importRules,
  javascriptRules,
  nodeRules,
  stylisticRules,
  turboRules,
  typescriptRules,
  typescriptTestRules,
} from "./rules/index.js";

const GLOB_INCLUDE = ["**/*.{js,ts,tsx}"];
const GLOB_INCLUDE_TEST = ["**/*.{test,spec}.{js,ts,tsx}"];
const GLOB_EXCLUDE = [
  "**/.turbo/**",
  "**/.svelte-kit/**",
  "**/build/**",
  "**/coverage/**",
  "**/dist/**",
  "**/snap/**",
  "**/generated/**",
  "**/node_modules/**",
  "**/eslint.config.js",
  "**/eslint.config.mjs",
  "**/prettier.config.js",
  "**/prettier.config.mjs",
  "**/vitest.config.js",
  "**/vitest.config.ts",
  "**/vite.config.js",
  "**/vite.config.ts",
  "**/vite-config/**",
  "**/vite.config.*.timestamp-*.*",
  "**/knip.config.ts",
  "**/svelte.config.js",
  ".wrangler/**",
  "worker-configuration.d.ts",
  "server",
  "**/drizzle.config.ts",
  "**drizzle.**.config.ts",
];

const rules = {
  ...javascriptRules,
  ...typescriptRules,
  ...importRules,
  ...nodeRules,
  ...stylisticRules,
  ...turboRules,
};
const testRules = {
  ...typescriptTestRules,
};
const plugins = {
  "@stylistic": pluginStylistic,
  import: pluginImport,
  node: pluginNode,
};

/** @type {import('eslint').Linter.Config} */
export default [
  {
    name: "moolah/ignore",
    ignores: GLOB_EXCLUDE,
  },
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  ...configTurbo,
  configPrettier,
  {
    name: "moolah/core",
    files: GLOB_INCLUDE,
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2020,
      parser: ts.parser,
      parserOptions: {
        project: true,
        parser: ts.parser,
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins,
    rules,
  },
  {
    name: "moolah/test",
    files: GLOB_INCLUDE_TEST,
    rules: testRules,
  },
];
