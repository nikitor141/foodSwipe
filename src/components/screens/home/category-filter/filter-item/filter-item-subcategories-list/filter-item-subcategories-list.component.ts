import { HybridComponent } from '@/core/component/component'
import { RenderService } from '@/core/services/render.service'

import styles from './filter-item-subcategories-list.module.scss'
import template from './filter-item-subcategories-list.template.html?raw'

export class FilterItemSubcategoriesList implements HybridComponent {
	static componentName = 'component-filter-item-subcategories-list'
	static #instancesByElement = new WeakMap<HTMLElement, FilterItemSubcategoriesList>()

	static from(element: HTMLElement) {
		return this.#instancesByElement.get(element)
	}

	element!: HTMLElement
	renderService: RenderService = RenderService.instance

	mount(parent: HTMLElement, method: 'append' | 'prepend') {
		if (!this.element) this.element = this.render()
		FilterItemSubcategoriesList.#instancesByElement.set(this.element, this)

		parent[method](this.element)
	}

	render() {
		this.element = this.renderService.htmlToElement(template, [], styles)

		return this.element
	}
}
