import baseConfig from "./base.js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
// import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "@typescript-eslint/eslint-plugin";
import { reactRules } from "./rules/react.js";
import { reactHooksRules } from "./rules/react-hooks.js";
import { jsxA11yRules } from "./rules/jsx-a11y.js";

const GLOB_INCLUDE = ["**/*.{js,jsx,ts,tsx}"];

// const plugins = {
//   react: pluginReact,
//   "react-hooks": pluginReactHooks,
//   "jsx-a11y": pluginJsxA11y,
// };

const rules = {
  ...reactRules,
  ...reactHooksRules,
  ...jsxA11yRules,
};

export default [
  ...baseConfig,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  pluginReactHooks.configs["recommended-latest"],
  pluginReactRefresh.configs.recommended,
  pluginJsxA11y.flatConfigs.recommended,
  {
    name: "moolah/react",
    files: GLOB_INCLUDE,
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules,
  },
];
