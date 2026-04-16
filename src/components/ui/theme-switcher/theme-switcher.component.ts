import { StaticComponent } from '@/core/component/component'
import { ObserverService } from '@/core/services/observer.service.ts'
import { RenderService } from '@/core/services/render.service'
import { ThemesService } from '@/core/services/themes.service.ts'
import { Store, StoreEvent } from '@/core/store/store.ts'

import styles from './theme-switcher.module.scss'
import template from './theme-switcher.template.html?raw'

export class ThemeSwitcher implements StaticComponent {
	static componentName = 'component-theme-switcher'

	element!: HTMLButtonElement
	renderService: RenderService = RenderService.instance
	#observerService: ObserverService = ObserverService.instance
	#themeService: ThemesService = ThemesService.instance
	#store: Store = Store.instance

	constructor() {
		this.#observerService.subscribe(this, [this.#store])
	}

	update({ type }: StoreEvent) {
		const isLayoutReady = this.#store.state.layoutReady

		switch (type) {
			case 'layoutReady':
			case 'theme': {
				if (isLayoutReady) this.#onUpdate()
				break
			}
		}
	}

	#addListeners() {
		this.element.addEventListener('click', () => this.#themeService.toggleTheme())
	}

	#onUpdate() {
		this.element.querySelector('use')!.setAttribute('href', '#' + this.#store.state.theme)
	}

	render() {
		this.element = this.renderService.htmlToElement(template, [], styles)

		this.#addListeners()

		return this.element
	}
}
