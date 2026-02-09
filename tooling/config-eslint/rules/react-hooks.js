/** @type {import('eslint').Linter.RulesRecord} */
export const reactHooksRules = {
  /**
   * Enforce Rules of Hooks - ESSENTIAL for React hooks to work correctly.
   * @example
   * // ✅ Good
   * function Component() {
   *   const [state, setState] = useState();
   *   useEffect(() => {}, []);
   *   return <div />;
   * }
   *
   * // ❌ Bad
   * function Component() {
   *   if (condition) {
   *     const [state, setState] = useState(); // Hook in conditional
   *   }
   * }
   */
  "react-hooks/rules-of-hooks": "error",
  /**
   * Enforce exhaustive dependencies in useEffect and other hooks.
   * @example
   * // ✅ Good
   * useEffect(() => {
   *   fetchData(id);
   * }, [id]); // All dependencies included
   *
   * // ✅ Good (no dependencies needed)
   * useEffect(() => {
   *   console.log('Component mounted');
   * }, []);
   *
   * // ❌ Bad (will warn)
   * useEffect(() => {
   *   fetchData(id);
   * }, []); // Missing 'id' dependency
   */
  // "react-hooks/exhaustive-deps": "warn",
};
