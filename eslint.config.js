import html from '@html-eslint/eslint-plugin'

export default [
	{
		...html.configs['flat/recommended'],
		files: ['**/*.html'],
		rules: {
			...html.configs['flat/recommended'].rules,
			'@html-eslint/indent': ['error', 'tab'],
			'@html-eslint/require-closing-tags': 'off',
			'@html-eslint/no-extra-spacing-attrs': 'off',
			'@html-eslint/attrs-newline': 'off',
			'@html-eslint/sort-attrs': [
				'warn',
				{
					priority: [
						'id',
						'class',
						'name',
						'content',
						'href',
						'src',
						'alt',
						'width',
						'height',
						'title',
						'aria-label',
						'autoplay',
						'muted',
						'loop',
						'preload',
						'placeholder',
						'required',
						'tabindex'
					]
				}
			]
		}
	}
]
