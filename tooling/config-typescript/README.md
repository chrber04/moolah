# @moolah/config-typescript

Shared TypeScript configuration for workspaces within the Earnit.GG monorepo.

## Structure

- `tsconfig.base.json`: Base TypeScript config
- `tsconfig.lib.json`: Library/package config
- `tsconfig.next.json`: Next.js app config
- `tsconfig.node.json`: Node.js config
- `tsconfig.react.json`: React config

## Usage

```json
{
  "extends": "@moolah/config-typescript/tsconfig.lib.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```
