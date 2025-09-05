import { ThemeSwitcher } from '@components/ui/theme-switcher/theme-switcher.component.ts'
import { Component } from '@core/component/component'

import { RenderService } from '@core/services/render.service'
import { Store } from '@core/store/store.ts'
import styles from './header.module.scss'
import template from './header.template.html?raw'

export class Header implements Component {
	element: HTMLElement
	renderService: RenderService = RenderService.instance
	store: Store = Store.instance
	screen = this.store.state.screen.current

	constructor() {
		this.store.addObserver(this)
	}

	update(): void {
		const indicator: HTMLElement = this.element.querySelector(`.${styles['header__nav-indicator']}`)
		const activeLinkCoords = this.element
			.querySelector(`.${styles['header__nav-link']}[href='/']`)
			.getBoundingClientRect()
		indicator.style.left = activeLinkCoords.left + 'px'
	}

	render(): HTMLElement {
		this.element = this.renderService.htmlToElement(template, [ThemeSwitcher], styles) as HTMLElement

		return this.element
	}
}
