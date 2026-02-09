import baseConfig from "@moolah/config-eslint/base";

/** @type {import('eslint').Linter.Config[]} */
export default [
	...baseConfig,
	{
		ignores: ["drizzle.config.ts", "drizzle.studio.config.ts"]
	}
];
