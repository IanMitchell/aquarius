module.exports = {
  env: {
		node: true,
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
	},
	plugins: ["@typescript-eslint"],
	extends: ["xo", "xo-typescript", "prettier"],
	rules: {
		"@typescript-eslint/no-base-to-string": 0,
		"@typescript-eslint/ban-types": 0,
		"@typescript-eslint/prefer-literal-enum-member": 0,
		"@typescript-eslint/naming-convention": 0,
		"@typescript-eslint/consistent-type-definitions": 0,
		"no-eq-null": 0,
		"no-bitwise": 0,
		"no-await-in-loop": 0,
		"eqeqeq": ["error", "smart"],
		"capitalized-comments": 0,
		"arrow-body-style": 0,
		"complexity": 0,
	},
	settings: {
		"import/resolver": {
			typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
		},
	},
};
