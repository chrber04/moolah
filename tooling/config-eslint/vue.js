import baseConfig from "./base.js";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import tseslint from "typescript-eslint";

const GLOB_INCLUDE = ["**/*.{js,ts,vue}"];

const vueRules = {
  // Vue 3 specific
  "vue/multi-word-component-names": "off",
  "vue/no-v-html": "warn",
  "vue/require-default-prop": "off",
  "vue/require-explicit-emits": "error",
  "vue/component-tags-order": [
    "error",
    {
      order: ["script", "template", "style"],
    },
  ],
  "vue/block-lang": [
    "error",
    {
      script: { lang: "ts" },
    },
  ],
  "vue/define-macros-order": [
    "error",
    {
      order: ["defineProps", "defineEmits", "defineSlots"],
    },
  ],
  "vue/no-unused-refs": "error",
  "vue/no-useless-v-bind": "error",
  "vue/prefer-separate-static-class": "error",
  "vue/prefer-true-attribute-shorthand": "error",
  "vue/eqeqeq": "error",
  "vue/no-console": "warn",
};

export default [
  ...baseConfig,
  ...pluginVue.configs["flat/recommended"],
  {
    name: "moolah/vue",
    files: GLOB_INCLUDE,
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
    },
    rules: vueRules,
  },
];
