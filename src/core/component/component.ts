import { RenderService } from '@core/services/render.service'

export type ComponentConstructor = new (...args: any) => Component

export interface Component {
	element: Element
	renderService: RenderService
	render(): Element | HTMLElement | SVGElement
	mount?(...args: any[]): void
	destroy?(): void
}
