import { DynamicComponent } from '@/core/component/component'
import { RenderService } from '@/core/services/render.service'

import styles from './wish-products-list-item.module.scss'
import template from './wish-products-list-item.template.html?raw'

export class WishProductsListItemComponent implements DynamicComponent {
	static componentName = 'component-wish-products-list-item'
	static #instancesByElement = new WeakMap<HTMLElement, WishProductsListItemComponent>()

	static from(element: HTMLElement) {
		return this.#instancesByElement.get(element)
	}

	element: HTMLLIElement | null = null
	renderService: RenderService = RenderService.instance
	isDestroying: boolean = false

	mount(parent: HTMLElement, method: 'append' | 'prepend') {
		if (!this.element) this.element = this.render()
		WishProductsListItemComponent.#instancesByElement.set(this.element, this)

		parent[method](this.element)
	}

	destroy() {
		if (this.isDestroying || !this.element) return
		this.isDestroying = true

		this.element.remove()
		this.element = null
	}

	render() {
		this.element = this.renderService.htmlToElement(template, [], styles)

		return this.element
	}
}
