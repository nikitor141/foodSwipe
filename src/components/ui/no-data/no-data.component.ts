import { DynamicComponent } from '@/core/component/component'
import { RenderService } from '@/core/services/render.service'

import styles from './no-data.module.scss'
import template from './no-data.template.html?raw'

export class NoData implements DynamicComponent {
	static componentName = 'component-no-data'
	static #instancesByElement = new WeakMap<HTMLElement, NoData>()

	static from(element: HTMLElement) {
		return this.#instancesByElement.get(element)
	}

	element: HTMLElement | null = null
	renderService: RenderService = RenderService.instance
	isDestroying: boolean = false

	constructor() {}

	mount(parent: HTMLElement, method: 'append' | 'prepend') {
		if (!this.element) this.element = this.render()

		NoData.#instancesByElement.set(this.element, this)

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
