/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type {PrettierConfig & TailwindConfig & SortImportsConfig} */
const config = {
	plugins: [
		'@ianvs/prettier-plugin-sort-imports',
		'prettier-plugin-svelte',
		'prettier-plugin-tailwindcss'
	],

	// Base Prettier
	printWidth: 100,
	singleQuote: false,
	useTabs: true,
	tabWidth: 2,
	semi: true,
	trailingComma: 'none',

	// Svelte
	overrides: [
		{
			files: '*.svelte',
			options: {
				parser: 'svelte'
			}
		}
	],

	// Tailwind
	tailwindFunctions: ['cn', 'cva'],

	// IANVS Sort Imports
	importOrder: [
		'<TYPES>',
		'<BUILTIN_MODULES>',
		// Svelte / SvelteKit
		'^svelte$',
		'^svelte/(.*)$',
		'^@sveltejs/(.*)$',
		'^\\$app/(.*)$',
		'^\\$env/(.*)$',
		// Hono
		'^hono$',
		'^hono/(.*)$',
		'<THIRD_PARTY_MODULES>',
		'',
		'<TYPES>^@moolah',
		'^@moolah/(.*)$',
		'',
		// SvelteKit $lib alias
		'<TYPES>^\\$lib/(.*)$',
		'^\\$lib/(.*)$',
		'',
		'<TYPES>^#(.*)$',
		'^#(.*)$',
		'',
		'<TYPES>^[../]',
		'^[../]',
		'<TYPES>^[./]',
		'^[./]'
	],
	importOrderParserPlugins: ['typescript', 'decorators-legacy'],
	importOrderTypeScriptVersion: '5.9.2'
};

export default config;
