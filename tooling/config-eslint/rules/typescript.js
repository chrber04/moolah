// https://typescript-eslint.io/rules/

/** @type {import('eslint').Linter.RulesRecord} */
export const typescriptRules = {
  /**
   * TODO: Decide if we want to enable this rule.
   * Prefer Array<T> format for array types.
   * @example
   * // ✅ Good
   * type MyArray = Array<string>;
   *
   * // ❌ Bad
   * type MyArray = string[];
   */
  // "@typescript-eslint/array-type": [
  //   "error",
  //   { default: "generic", readonly: "generic" },
  // ],
  "@typescript-eslint/array-type": "off",

  /**
   * Prevent @ts-ignore, allow @ts-expect-error with description.
   * @example
   * // ✅ Good
   * // @ts-expect-error This is a known issue
   * someFunction();
   *
   * // ❌ Bad
   * // @ts-ignore
   * someFunction();
   */
  "@typescript-eslint/ban-ts-comment": [
    "error",
    {
      "ts-expect-error": false,
      "ts-ignore": "allow-with-description",
    },
  ],

  /**
   * Enforce import type { T } for type imports.
   * @example
   * // ✅ Good
   * import type { MyType } from './types';
   *
   * // ❌ Bad
   * import { MyType } from './types';
   */
  "@typescript-eslint/consistent-type-imports": [
    "error",
    { prefer: "type-imports", fixStyle: "separate-type-imports" },
  ],

  /**
   * Enforce shorthand method style for method signatures.
   * @example
   * // ✅ Good
   * interface MyInterface {
   *   myMethod(): void;
   * }
   *
   * // ❌ Bad
   * interface MyInterface {
   *   myMethod: () => void;
   * }
   */
  "@typescript-eslint/method-signature-style": ["error", "property"],

  /**
   * Enforce generic type naming convention.
   * @example
   * // ✅ Good
   * function myFunction<T>(arg: T): T {
   *   return arg;
   * }
   *
   * // ❌ Bad
   * function myFunction<t>(arg: t): t {
   *   return arg;
   * }
   */
  "@typescript-eslint/naming-convention": [
    "error",
    {
      selector: "typeParameter",
      format: ["PascalCase"],
      leadingUnderscore: "forbid",
      trailingUnderscore: "forbid",
      custom: {
        regex: "^(T|T[A-Z][A-Za-z]+)$",
        match: true,
      },
    },
  ],

  /**
   * Disallow duplicate enum values.
   * @example
   * // ✅ Good
   * enum MyEnum {
   *   A = 1,
   *   B = 2,
   * }
   *
   * // ❌ Bad
   * enum MyEnum {
   *   A = 1,
   *   B = 1,
   * }
   */
  "@typescript-eslint/no-duplicate-enum-values": "error",

  /**
   * Disallow extra non-null assertions.
   * @example
   * // ✅ Good
   * const value = myObject!.myProperty;
   *
   * // ❌ Bad
   * const value = myObject!!.myProperty;
   */
  "@typescript-eslint/no-extra-non-null-assertion": "error",

  /**
   * Disallow 'for-in' loops over arrays.
   * @example
   * // ✅ Good
   * for (const item of myArray) {
   *   console.log(item);
   * }
   *
   * // ❌ Bad
   * for (const index in myArray) {
   *   console.log(myArray[index]);
   * }
   */
  "@typescript-eslint/no-for-in-array": "error",

  /**
   * Disallow explicit type annotations for simple types.
   * @example
   * // ✅ Good
   * const myString = 'hello';
   *
   * // ❌ Bad
   * const myString: string = 'hello';
   */
  "@typescript-eslint/no-inferrable-types": [
    "error",
    { ignoreParameters: true },
  ],

  /**
   * Enforce valid usage of 'new' and 'constructor'.
   * @example
   * // ✅ Good
   * class MyClass {
   *   constructor() {}
   * }
   *
   * const instance = new MyClass();
   *
   * // ❌ Bad
   * class MyClass {}
   *
   * const instance = MyClass();
   */
  "@typescript-eslint/no-misused-new": "error",

  /**
   * Disallow misused Promises, with custom void return handling.
   * @example
   * // ✅ Good
   * button.addEventListener('click', async () => {
   *   await handleClick();
   * });
   *
   * // ✅ Good (allowed with attributes: false)
   * <button onClick={async () => await handleClick()} />
   *
   * // ❌ Bad
   * if (await somePromise) {
   *   // ...
   * }
   */
  "@typescript-eslint/no-misused-promises": [
    "error",
    { checksVoidReturn: { attributes: false } },
  ],

  /**
   * Disallow TypeScript namespaces.
   * @example
   * // ✅ Good
   * export const myValue = 42;
   *
   * // ❌ Bad
   * namespace MyNamespace {
   *   export const myValue = 42;
   * }
   */
  "@typescript-eslint/no-namespace": "error",

  /**
   * Disallow non-null assertions after optional chain expressions.
   * @example
   * // ✅ Good
   * const value = myObject?.myProperty;
   *
   * // ❌ Bad
   * const value = myObject?.myProperty!;
   */
  "@typescript-eslint/no-non-null-asserted-optional-chain": "error",

  /**
   * Disallow unnecessary conditionals that always evaluate to truthy or falsy.
   * @example
   * // ✅ Good
   * if (myVariable === true) {
   *   // ...
   * }
   *
   * // ❌ Bad
   * if (myVariable === true && someOtherCondition) {
   *   // ...
   * }
   */
  "@typescript-eslint/no-unnecessary-condition": "off", // TODO: enable this. But it causes issues with the current codebase.

  /**
   * Disallow unnecessary type assertions.
   * @example
   * // ✅ Good
   * const value = 42;
   *
   * // ❌ Bad
   * const value = 42 as number;
   */
  "@typescript-eslint/no-unnecessary-type-assertion": "error",

  /**
   * Disallow unsafe function types.
   * @example
   * // ✅ Good
   * type MyFunction = (arg: string) => void;
   *
   * // ❌ Bad
   * type MyFunction = Function;
   */
  "@typescript-eslint/no-unsafe-function-type": "error",

  /**
   * Disallow confusing primitive wrapper types.
   * @example
   * // ✅ Good
   * const myString: string = 'hello';
   *
   * // ❌ Bad
   * const myString: String = 'hello';
   */
  "@typescript-eslint/no-wrapper-object-types": "error",

  /**
   * Enforce the use of 'as const' for literal types.
   * @example
   * // ✅ Good
   * const myValue = 'hello' as const;
   *
   * // ❌ Bad
   * const myValue: 'hello' = 'hello';
   */
  "@typescript-eslint/prefer-as-const": "error",

  /**
   * Prefer 'for-of' loop over standard 'for' loop.
   * @example
   * // ✅ Good
   * for (const item of myArray) {
   *   console.log(item);
   * }
   *
   * // ❌ Bad
   * for (let i = 0; i < myArray.length; i++) {
   *   console.log(myArray[i]);
   * }
   */
  "@typescript-eslint/prefer-for-of": "warn",

  /**
   * Warn about async functions with no 'await' expression.
   * @example
   * // ✅ Good
   * async function myFunction() {
   *   await someAsyncOperation();
   * }
   *
   * // ❌ Bad
   * async function myFunction() {
   *   someOperation();
   * }
   */
  "@typescript-eslint/require-await": "warn",

  /**
   * Prefer ES module-style imports over triple-slash references.
   * @example
   * // ✅ Goodd
   * import { MyType } from './my-module';
   *
   * // ❌ Bad
   * /// <reference path="./my-module.d.ts" />
   */
  "@typescript-eslint/triple-slash-reference": "error",

  /**
   * Disallow unused variables, with exceptions for variables prefixed with underscore.
   * @example
   * // ✅ Good
   * const _unusedVariable = 42;
   * function myFunction(_unusedArg: string, usedArg: number) {
   *   return usedArg * 2;
   * }
   *
   * // ❌ Bad
   * const unusedVariable = 42;
   * function myFunction(unusedArg: string, usedArg: number) {
   *   return usedArg * 2;
   * }
   */
  "@typescript-eslint/no-unused-vars": [
    "error",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
  ],

  /**
   * Disallow non-null assertions (!).
   * @example
   * // ✅ Good
   * const value = myObject?.myProperty;
   * if (myObject) {
   *   const value = myObject.myProperty;
   * }
   *
   * // ❌ Bad
   * const value = myObject!.myProperty;
   */
  "@typescript-eslint/no-non-null-assertion": "error",

  // "@typescript-eslint/only-throw-error": [
  //   "error",
  //   {
  //     allow: ["Redirect", "redirect", "RedirectError", "redirectError"],
  //     allowThrowingAny: false,
  //     allowThrowingUnknown: false,
  //   },
  // ],

  // ------------------------------- OFF RULES -------------------------------

  "@typescript-eslint/prefer-nullish-coalescing": "off",
  "@typescript-eslint/only-throw-error": "off",
  "@typescript-eslint/prefer-optional-chain": "off",
  // TODO: enable this. Placing a void expression inside another expression is forbidden. Move it to its own statement instead.eslint@typescript-eslint/no-confusing-void-expression
  "@typescript-eslint/no-confusing-void-expression": "off",
  // TODO: enable this. The void operator is used to ignore the return value of a function. Use it only when you want to ignore the return value of a function.
  "@typescript-eslint/no-invalid-void-type": "off",
  // TODO: enable this. But it causes issues with the current codebase.
  "@typescript-eslint/consistent-type-definitions": "off",
  // TODO: enable this. But it causes issues with the current codebase.
  "@typescript-eslint/restrict-template-expressions": "off",
  "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
  // TODO: enable this. But it causes issues with the current codebase.
  "@typescript-eslint/method-signature-style": "off",
};

export const typescriptTestRules = {
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-unsafe-argument": "off",
  "@typescript-eslint/no-unsafe-assignment": "off",
  "@typescript-eslint/no-unsafe-member-access": "off",
  "@typescript-eslint/no-unsafe-call": "off",
  "@typescript-eslint/no-unsafe-return": "off",
};
