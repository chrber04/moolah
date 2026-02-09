import svelteConfig from "@moolah/config-eslint/svelte";

/** @type {import('eslint').Linter.Config[]} */
export default [
	...svelteConfig,
	{
		ignores: [".svelte-kit/**", "dist/**"]
	}
];
