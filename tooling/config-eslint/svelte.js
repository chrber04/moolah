import baseConfig from "./base.js";
import pluginSvelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import ts from "typescript-eslint";
import globals from "globals";

const svelteRules = {
  // Svelte 5 specific
  "svelte/no-at-html-tags": "warn",
  "svelte/valid-compile": "error",
  "svelte/no-unused-svelte-ignore": "error",
  "svelte/no-reactive-reassign": "error",
  "svelte/require-each-key": "error",
  "svelte/no-dom-manipulating": "warn",
  "svelte/no-store-async": "error",
  "svelte/block-lang": [
    "error",
    {
      script: "ts",
    },
  ],
};

export default [
  ...baseConfig,
  ...pluginSvelte.configs["flat/recommended"],
  prettier,
  ...pluginSvelte.configs["flat/prettier"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    name: "moolah/svelte",
    files: ["**/*.svelte"],
    ignores: [".svelte-kit/*"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
    rules: svelteRules,
  },
];
