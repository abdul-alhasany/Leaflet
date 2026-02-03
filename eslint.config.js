import config from 'eslint-config-mourner';
import css from '@eslint/css';
import scriptTags from '@mapbox/eslint-plugin-script-tags';
import importPlugin from 'eslint-plugin-import-x';
import globals from 'globals';
import baselineJs from 'eslint-plugin-baseline-js';
import tsEslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import pluginVue from 'eslint-plugin-vue';
import VueParser from 'vue-eslint-parser';

export default [
	...pluginVue.configs['flat/recommended'],
	...config.map(c => ({
		...c,
		files: ['**/*.js', '**/*.cjs', '**/*.ts', '**/*.vue']
	})),
	{
		ignores: [
			'dist/*.js',
			'docs/docs/highlight',
			'docs/examples/choropleth/us-states.js',
			'docs/examples/geojson/sample-geojson.js',
			'docs/examples/map-panes/eu-countries.js',
			'docs/examples/extending-2-layers/index.md',
			'docs/examples/quick-start/index.md', // importmap is not recognized by eslint
			'docs/download.md', // importmap is not recognized by eslint
			'docs/_posts/2025-05-18-leaflet-2.0.0-alpha.md', // importmap is not recognized by eslint
			'docs/_posts/201*',
			'docs/_site',
			'coverage'
		]
	},
	{
		files: ['**/*.js', '**/*.cjs', '**/*.ts'],
		plugins: {
			import: importPlugin
		},
		rules: {
			'dot-notation': 'off',
			'consistent-return': 'off',
			'curly': 'error',
			'no-unused-expressions': ['error', {allowShortCircuit: true}],
			'no-unused-vars': ['error', {caughtErrors: 'none'}],

			'import/extensions': ['error', 'ignorePackages'],

			'@stylistic/indent': ['error', 'tab', {VariableDeclarator: 0, flatTernaryExpressions: true}],
			'@stylistic/no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
			'@stylistic/key-spacing': 'off',
			'@stylistic/linebreak-style': ['off', 'unix'],
			'@stylistic/spaced-comment': 'error',

			// TODO: Re-enable the rules below and fix the linting issues.
			'no-invalid-this': 'off',
			'prefer-exponentiation-operator': 'error',
			'prefer-object-has-own': 'error',
			'prefer-spread': 'off',
			'no-new': 'off'
		}
	},
	{
		files: ['**/*.css'],
		language: 'css/css',
		...css.configs.recommended,
		rules: {
			...css.configs.recommended.rules,
			'css/no-important': 'warn',
			'css/use-baseline': ['error', {
				allowProperties: [
					'clip',
					'outline',
					'print-color-adjust',
					'user-select',
					'word-break',
				],
				allowSelectors: [
					'has',
					'nesting',
				]
			}]
		}
	},
	{
		files: ['src/**/*.{js,ts,jsx,tsx}'],
		plugins: {'baseline-js': baselineJs},
		rules: {
			'baseline-js/use-baseline': ['error', {
				available: 'widely',
				includeWebApis: {preset: 'auto', ignore: [
					// According to https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio, the feature is only partially supported in Safari:
					// In Safari on iOS, the devicePixelRatio does not change when the page is zoomed. See bug https://webkit.org/b/124862.
					'devicepixelratio',
				]},
				includeJsBuiltins: {preset: 'auto'},
			}],
		},
	},
	{
		files: ['**/*.{ts,tsx}'],
		plugins: {'@typescript-eslint': tsEslint.plugin},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: 'module',
			},
		},
		rules:{
			'@stylistic/semi': ['error', 'always']
		}
	},
	{
		files: ['*.vue', '**/*.vue'],
		languageOptions: {
			parser: VueParser,
			parserOptions: {
				parser: tsParser,
				ecmaFeatures: {
					jsx: true,
				},
				extraFileExtensions: ['.vue'],
				sourceType: 'module',
			},
		},
		plugins: {
			'@typescript-eslint': tsEslint.plugin,
			'vue': pluginVue
		},
		rules: {
			'no-undef': 'off',
			'no-unused-vars': 'off',
			'@stylistic/semi': ['error', 'always']
		},
	},
	{
		files: ['docs/examples/**', 'docs/plugins.md'],
		rules: {
			'@stylistic/eol-last': 'off',
		},
	},
	{
		files: ['spec/**'],
		languageOptions: {
			globals: {...globals.mocha}
		},
		rules: {
			'no-unused-expressions': 'off'
		}
	},
	{
		files: ['docs/**/*.md'],
		plugins: {
			scriptTags: {
				processors: {md: scriptTags.processors['.md']}
			}
		},
		processor: 'scriptTags/md',
		rules: {
			'no-unused-vars': 'off',
			'@stylistic/js/eol-last': 'off'
		},
		languageOptions: {
			globals: {L: false}
		}
	}
];
