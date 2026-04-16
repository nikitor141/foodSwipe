import { RenderService } from '@/core/services/render.service'

export type ComponentConstructor = { componentName: string; new (...args: any): Component }

export interface Component<TElement extends Element = HTMLElement> {
	element: TElement | null
	renderService: RenderService
	render(): TElement
	update?({ type, data }: any): void
}

export interface StaticComponent extends Component {}

export interface DynamicComponent extends Component {
	isDestroying: boolean
	mount(parent: HTMLElement, method: 'append' | 'prepend'): void
	destroy(...args: unknown[]): void
}

export interface HybridComponent extends StaticComponent, DynamicComponent {}
