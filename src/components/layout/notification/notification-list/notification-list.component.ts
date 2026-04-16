import { StaticComponent } from '@/core/component/component'
import { ObserverService } from '@/core/services/observer.service.ts'
import { RenderService } from '@/core/services/render.service'
import { Store, StoreEvent } from '@/core/store/store.ts'

import styles from './notification-list.module.scss'
import template from './notification-list.template.html?raw'

export class NotificationList implements StaticComponent {
	static componentName = 'component-notification-list'

	element!: HTMLElement
	renderService: RenderService = RenderService.instance

	#observerService: ObserverService = ObserverService.instance
	#store: Store = Store.instance

	constructor() {
		this.#observerService.subscribe(this, [this.#store])
	}

	update({ type, data }: StoreEvent) {
		const isScreenReady = this.#store.state.screenReady

		switch (type) {
			case 'screenReady': {
				if (isScreenReady) this.#onScreenReady()
				break
			}
		}
	}

	#onScreenReady() {
		this.#addListenersRequiredReadyDOM()
	}

	#addListenersRequiredReadyDOM() {}
	#addListeners() {}

	render() {
		this.element = this.renderService.htmlToElement(template, [], styles)

		this.#addListeners()
		return this.element
	}
}
