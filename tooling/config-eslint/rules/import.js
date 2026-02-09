// https://github.com/un-ts/eslint-plugin-import-x

/** @type {import('eslint').Linter.RulesRecord} */
export const importRules = {
  /**
   * Enforces a consistent style for type-only imports.
   * @example
   * // ✅ Good
   * import { type Foo } from 'module';
   *
   * // ❌ Bad
   * import { Foo } from 'module';
   */
  "import/consistent-type-specifier-style": ["error", "prefer-top-level"],

  /**
   * Requires all import statements to be placed at the top of the file.
   * @example
   * // ✅ Good
   * import { foo } from 'module';
   * import { bar } from 'another-module';
   *
   * const result = foo() + bar();
   *
   * // ❌ Bad
   * const result = foo();
   * import { foo } from 'module';
   */
  "import/first": "error",

  /**
   * Enforces a newline after the last import statement.
   * @example
   * // ✅ Good
   * import { foo } from 'module';
   * import { bar } from 'another-module';
   *
   * const result = foo() + bar();
   *
   * // ❌ Bad
   * import { foo } from 'module';
   * import { bar } from 'another-module';
   * const result = foo() + bar();
   */
  "import/newline-after-import": "error",

  /**
   * Disallows the use of CommonJS-style `require()` and `module.exports`.
   * @example
   * // ✅ Good
   * import { foo } from 'module';
   * export const bar = () => {};
   *
   * // ❌ Bad
   * const foo = require('module');
   * module.exports = { bar: () => {} };
   */
  "import/no-commonjs": "error",

  /**
   * Prevents import cycles in the codebase.
   * @example
   * // ✅ Good
   * // module-a.js
   * import { bar } from './module-b';
   * export const foo = () => {};
   *
   * // module-b.js
   * import { baz } from './module-c';
   * export const bar = () => {};
   *
   * // ❌ Bad
   * // module-a.js
   * import { bar } from './module-b';
   * export const foo = () => {};
   *
   * // module-b.js
   * import { foo } from './module-a';
   * export const bar = () => {};
   */
  "import/no-cycle": "error",

  /**
   * Reports if the same module is imported more than once in a file.
   * @example
   * // ✅ Good
   * import { foo } from 'module';
   *
   * // ❌ Bad
   * import { foo } from 'module';
   * import { bar } from 'module';
   */
  "import/no-duplicates": "error",
};
