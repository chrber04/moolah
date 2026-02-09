# @moolah/config-prettier

Shared Prettier configuration for workspaces within the Moolah monorepo.

## Usage

```javascript
import baseConfig from "@moolah/config-prettier";

export default {
	...baseConfig,
	tailwindConfig: "tailwind.config.ts",
	tailwindFunctions: ["cn", "cn", "mergeCn"]
};
```
