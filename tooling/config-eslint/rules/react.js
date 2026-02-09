/** @type {import('eslint').Linter.RulesRecord} */
export const reactRules = {
  /**
   * Disable prop-types validation since we use TypeScript for type checking.
   * @example
   * // ✅ Good (TypeScript handles types)
   * interface Props {
   *   name: string;
   * }
   * function Component({ name }: Props) {
   *   return <div>{name}</div>;
   * }
   *
   * // ❌ Not needed
   * Component.propTypes = {
   *   name: PropTypes.string.isRequired
   * };
   */
  "react/prop-types": "off",

  /**
   * Disable since we don't need to import React in modern JSX transform.
   * @example
   * // ✅ Good (new JSX transform)
   * function Component() {
   *   return <div>Hello</div>;
   * }
   *
   * // ❌ Not needed anymore
   * import React from 'react';
   * function Component() {
   *   return React.createElement('div', null, 'Hello');
   * }
   */
  "react/jsx-uses-react": "off",

  /**
   * Disable React import requirement for JSX (new JSX transform).
   * @example
   * // ✅ Good (automatic JSX runtime)
   * function Component() {
   *   return <div>Hello</div>;
   * }
   *
   * // ❌ Not required anymore
   * import React from 'react';
   * function Component() {
   *   return <div>Hello</div>;
   * }
   */
  "react/react-in-jsx-scope": "off",

  /**
   * Warn about elements that can be self-closing but aren't.
   * @example
   * // ✅ Good
   * <img src="image.jpg" alt="description" />
   * <input type="text" />
   *
   * // ⚠️ Warning
   * <img src="image.jpg" alt="description"></img>
   * <input type="text"></input>
   */
  "react/self-closing-comp": "warn",

  /**
   * TODO: Add perfectionist eslint?
   *
   * Warn about unsorted JSX props to improve readability and consistency.
   * @example
   * // ✅ Good (sorted according to rules)
   * <Component
   *   key="unique"
   *   ref={myRef}
   *   className="container"
   *   disabled
   *   id="myComponent"
   *   onClick={handleClick}
   *   onKeyDown={handleKeyDown}
   * />
   *
   * // ⚠️ Warning (unsorted)
   * <Component
   *   onClick={handleClick}
   *   className="container"
   *   key="unique"
   *   disabled
   * />
   */
  //   "react/jsx-sort-props": [
  //     "warn",
  //     {
  //       callbacksLast: true,
  //       shorthandFirst: true,
  //       noSortAlphabetically: false,
  //       reservedFirst: true,
  //     },
  //   ],
};
