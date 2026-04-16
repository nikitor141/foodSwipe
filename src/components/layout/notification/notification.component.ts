import { DynamicComponent } from '@/core/component/component'
import { DragService } from '@/core/services/drag.service.ts'
import { RenderService } from '@/core/services/render.service'

import styles from './notification.module.scss'
import template from './notification.template.html?raw'

export type NotificationType = 'positive' | 'negative' | 'neutral'

export class Notification implements DynamicComponent {
	static componentName = 'component-notification'
	static #instancesByElement = new WeakMap<HTMLElement, Notification>()

	static from(element: HTMLElement) {
		return this.#instancesByElement.get(element)
	}

	element: HTMLElement | null = null
	renderService: RenderService = RenderService.instance
	dragService: DragService = DragService.instance
	isDestroying: boolean = false

	message: string
	type: NotificationType
	timeout: ReturnType<typeof setTimeout> | null = null

	constructor(message: string, type: NotificationType) {
		this.message = message
		this.type = type
	}

	#addListenersRequiredReadyDOM() {
		if (!this.element) return

		this.dragService.attach(this.element, {
			componentInstance: this,
			direction: 'vertical',
			threshold: 150,
			resistance: 1,
			snap: { animation: true, forwards: true }
		})
	}

	mount(parent: HTMLElement, method: 'append' | 'prepend') {
		if (!this.element) this.element = this.render()

		Notification.#instancesByElement.set(this.element, this)

		parent[method](this.element)

		requestAnimationFrame(() => {
			if (!this.element || this.isDestroying) return
			this.#addListenersRequiredReadyDOM()
		})
	}

	destroy() {
		if (this.isDestroying || !this.element) return

		this.isDestroying = true
		this.element.classList.add(styles['notification--vanishing']!)

		this.element.onanimationend = () => {
			if (!this.element) return

			this.element.dispatchEvent(new CustomEvent('notifDestroyed', { bubbles: true, detail: { instance: this } }))

			this.dragService.detach(this.element)
			this.element.onanimationend = null
			this.element.remove()
			this.element = null
		}
	}

	render() {
		this.element = this.renderService.htmlToElement(template, [], styles)

		this.element.textContent = this.message

		const classNames = {
			positive: styles['notification--positive']!,
			negative: styles['notification--negative']!,
			neutral: styles['notification--neutral']!
		} satisfies Record<NotificationType, string>

		const className = classNames[this.type]

		this.element.classList.add(className)

		return this.element
	}
}
