import { Component } from '@core/component/component'
import { RenderService } from '@core/services/render.service'
import styles from './header.module.scss'
import template from './header.template.html?raw'

export class Header implements Component {
	element: HTMLElement
	renderService: RenderService = RenderService.instance

	render(): HTMLElement {
		this.element = this.renderService.htmlToElement(template, [], styles) as HTMLElement

		return this.element
	}
}
