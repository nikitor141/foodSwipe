import { Component } from '@core/component/component'
import { RenderService } from '@core/services/render.service'
import { ThemesService } from '@core/services/themes.service.ts'
import { Store } from '@core/store/store.ts'
import styles from './theme-switcher.module.scss'
import template from './theme-switcher.template.html?raw'

export class ThemeSwitcher implements Component {
	element: HTMLElement
	renderService: RenderService = RenderService.instance
	store: Store = Store.instance
	themeService: ThemesService = ThemesService.instance

	constructor() {
		this.store.addObserver(this)
	}

	update() {
		this.element.classList.remove(styles['theme-switcher--system'])
		this.element.querySelector('#use').setAttribute('href', '#' + this.store.state.theme)
	}

	render(): HTMLElement {
		this.element = this.renderService.htmlToElement(template, [], styles) as HTMLElement

		this.element.onclick = () => this.themeService.toggleTheme()

		this.update()
		return this.element
	}
}
