import ChildComponent from '@/core/component/child.component'
import renderService from '@/core/services/render.service'
import { ThemesService } from '@/core/services/themes.service'

import * as styles from './layout.module.scss'
import template from './layout.template.html'

export class Layout extends ChildComponent {
	constructor() {
		super()

		new ThemesService()
	}

	render() {
		this.element = renderService.htmlToElement(template, [], styles)
		return this.element
	}
}
