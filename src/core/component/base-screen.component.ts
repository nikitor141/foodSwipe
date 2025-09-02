import { RenderService } from '@core/services/render.service'
import { getTitle } from '@/config/seo.config'
import { Component } from './component'

export type BaseScreenConstructor = new (...args: any) => BaseScreen

export abstract class BaseScreen implements Component {
	abstract element: HTMLElement
	abstract renderService: RenderService
	title: string

	constructor({ title }: { title: string }) {
		document.title = getTitle(title)
	}

	abstract render(): HTMLElement

	destroy?(): void
	removeListeners?(): void
	addListeners?(): void
}
