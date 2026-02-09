# @moolah/config-eslint

Shared ESLint configuration for workspaces within the Earnit.GG monorepo.

## Presets

- `base.js`: Base ESLint rules
- `typescript.js`: TypeScript-specific rules
- `react.js`: React/JSX rules
- `next.js`: Next.js specific rules

## Usage

```ts
import baseConfig from "@moolah/config-eslint/base";
import svelteConfig from "@moolah/config-eslint/svelte";
import typescriptConfig from "@moolah/config-eslint/typescript";

/** @type {import('eslint').Linter.Config[]} */
export default [...baseConfig, ...typescriptConfig, ...svelteConfig];
```
