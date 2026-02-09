/** @type {import('eslint').Linter.RulesRecord} */
export const turboRules = {
  /**
   * Disallow undeclared environment variables in Turbo configuration.
   * @example
   * // ✅ Good
   * {
   *   "pipeline": {
   *     "build": {
   *       "dependsOn": ["^build"],
   *       "env": ["NODE_ENV"]
   *     }
   *   }
   * }
   *
   * // ❌ Bad
   * {
   *   "pipeline": {
   *     "build": {
   *       "dependsOn": ["^build"],
   *       "env": ["UNDECLARED_ENV_VAR"]
   *     }
   *   }
   * }
   */
  "turbo/no-undeclared-env-vars": "error",
};
