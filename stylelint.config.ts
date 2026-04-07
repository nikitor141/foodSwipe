import type { Config } from 'stylelint'
export default {
	extends: ['stylelint-config-recommended-scss', 'stylelint-config-recess-order'],
	rules: {
		'block-no-empty': null,
		'no-descending-specificity': null
	},
	customSyntax: 'postcss-scss'
} satisfies Config
