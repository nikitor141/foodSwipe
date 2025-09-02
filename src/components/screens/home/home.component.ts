import { RenderService } from '@core/services/render.service'
import { TITLE_HOME } from '@/constants/titles.constants'
import { BaseScreen } from '@/core/component/base-screen.component'
import styles from './home.module.scss'
import template from './home.template.html?raw'

export class Home extends BaseScreen {
	element: HTMLElement
	renderService: RenderService = RenderService.instance

	constructor() {
		super({ title: TITLE_HOME })
	}

	render(): HTMLElement {
		this.element = this.renderService.htmlToElement(template, [], styles) as HTMLElement

		return this.element
	}
}
