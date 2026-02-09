/** @type {import('eslint').Linter.RulesRecord} */
export const jsxA11yRules = {
  /**
   * Require alt text for images.
   * @example
   * // ✅ Good
   * <img src="photo.jpg" alt="Beautiful sunset" />
   *
   * // ❌ Bad
   * <img src="photo.jpg" />
   */
  "jsx-a11y/alt-text": "error",

  /**
   * Require keyboard event handlers for clickable elements.
   * @example
   * // ✅ Good
   * <div onClick={handleClick} onKeyDown={handleKeyDown} />
   *
   * // ⚠️ Warning
   * <div onClick={handleClick} />
   */
  "jsx-a11y/click-events-have-key-events": "warn",

  /**
   * Require interactive elements to support focus.
   * @example
   * // ✅ Good
   * <div role="button" tabIndex={0} onClick={handleClick} />
   *
   * // ⚠️ Warning
   * <div role="button" onClick={handleClick} />
   */
  "jsx-a11y/interactive-supports-focus": "warn",

  /**
   * Require labels for form controls.
   * @example
   * // ✅ Good
   * <label htmlFor="email">Email</label>
   * <input id="email" type="email" />
   *
   * // ❌ Bad
   * <input type="email" />
   */
  "jsx-a11y/label-has-associated-control": "error",
};
