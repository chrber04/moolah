// https://eslint.style/packages/js

/** @type {import('eslint').Linter.RulesRecord} */
export const stylisticRules = {
  /**
   * Enforce consistency of spacing after the start of a comment.
   * @example
   * // ✅ Good
   * // This is a comment
   *
   * // ❌ Bad
   * //This is a comment
   */
  "@stylistic/spaced-comment": "error",
};
