import autoprefixer from 'autoprefixer'
import path from 'path'
import { imagetools } from 'vite-imagetools'
import webfontDownload from 'vite-plugin-webfont-dl'
import { defineConfig } from 'vite-plus'

export default defineConfig({
	staged: {
		'*': 'vp check --fix'
	},
	resolve: {
		alias: {
			'@': path.resolve('/src')
		}
	},
	plugins: [imagetools(), webfontDownload()],
	css: {
		postcss: {
			plugins: [autoprefixer()]
		}
	},
	lint: {
		rules: {
			'no-console': 'error',
			'no-case-declarations': 'error',
			'no-empty': 'error',
			'no-fallthrough': 'error',
			'no-redeclare': 'error',
			'no-regex-spaces': 'error',
			'no-unexpected-multiline': 'error',
			'no-unused-expressions': ['error', { allowTernary: true }]
		}
		// "plugins": ["eslint", "typescript", "unicorn", "oxc",] // включены по дефолту
	},
	fmt: {
		useTabs: true,
		tabWidth: 2,
		printWidth: 120,
		singleQuote: true,
		jsxSingleQuote: false,
		quoteProps: 'as-needed',
		trailingComma: 'none',
		semi: false,
		arrowParens: 'avoid',
		bracketSameLine: false,
		bracketSpacing: true,
		singleAttributePerLine: false,
		sortImports: {
			groups: [
				'type-import',
				['value-builtin', 'value-external'],
				'type-internal',
				'value-internal',
				['type-parent', 'type-sibling', 'type-index'],
				['value-parent', 'value-sibling', 'value-index'],
				'unknown'
			]
		},
		overrides: [
			{
				files: ['**/*.{html,scss,css}'],
				options: {
					singleQuote: false
				}
			}
		],
		ignorePatterns: []
	}
})
