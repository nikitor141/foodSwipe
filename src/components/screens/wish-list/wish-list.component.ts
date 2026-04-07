import { WishProducts } from '@/components/screens/wish-list/wish-products/wish-products.component.ts'
import { TITLE_WISH_LIST } from '@/constants/titles.constants'
import { BaseScreen } from '@/core/component/base-screen.component'
import { RenderService } from '@/core/services/render.service'

import styles from './wish-list.module.scss'
import template from './wish-list.template.html?raw'

export class WishList extends BaseScreen {
	element!: HTMLElement
	renderService: RenderService = RenderService.instance
	path!: string

	protected constructor() {
		super()
	}

	init() {
		super.setTitle({ title: TITLE_WISH_LIST })
	}

	render(): HTMLElement {
		this.element = this.renderService.htmlToElement(template, [WishProducts], styles) as HTMLElement

		return this.element
	}
}
