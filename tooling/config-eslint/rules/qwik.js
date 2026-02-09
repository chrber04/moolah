// tooling/config-eslint/rules/qwik.js
export const qwikRules = {
  // Qwik-specific rules
  "qwik/jsx-img": "error",
  "qwik/jsx-a": "error",
  "qwik/loader-location": "error",
  "qwik/no-react-props": "error",
  "qwik/unused-server": "warn",
  "qwik/valid-lexical-scope": "error",

  // TypeScript adjustments for Qwik
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-floating-promises": "off",

  // Allow unused vars with _ prefix
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      destructuredArrayIgnorePattern: "^_",
    },
  ],
};
