import { Notification, NotificationType } from '@/components/layout/notification/notification.component'
import { SELECTOR_NOTIFICATIONS_LIST } from '@/constants/selectors.constants'
import { DragEndEvent, DragStartEvent } from '@/core/services/drag.types.ts'
import { Singleton } from '@/utils/singleton'

export class NotificationService extends Singleton {
	#queue: Notification[] = []
	#active = new Set<Notification>()
	#limit: number = 3
	#container!: HTMLElement

	protected constructor() {
		super()
	}

	show(message: string, type: NotificationType = 'neutral') {
		const notif = new Notification(message, type)
		if (this.#active.size >= this.#limit) {
			this.#queue.push(notif)
			return
		}

		this.#showNotif(notif)
	}

	#getContainer() {
		return (this.#container ??= document.querySelector(SELECTOR_NOTIFICATIONS_LIST)!)
	}

	#showNotif(notif: Notification) {
		this.#active.add(notif)
		notif.mount(this.#getContainer(), 'prepend')
		this.#addListeners(notif)

		this.#setNotifTimeout(notif)
	}

	#setNotifTimeout(notif: Notification) {
		notif.timeout = setTimeout(() => this.#destroyNotif(notif), 300000)
	}

	#destroyNotif(notif: Notification) {
		if (!notif.timeout) return

		clearTimeout(notif.timeout)
		notif.destroy()
	}

	#handleDestroyed = (e: DragCustomEvent<Notification>) => {
		this.#active.delete(e.detail.instance)
		this.#removeListeners(e.detail.instance)

		if (this.#queue.length > 0) {
			const notif = this.#queue.shift()!

			this.#showNotif(notif)
		}
	}

	#handleDragstart = (e: DragStartEvent<Notification>) => {
		if (!e.detail.instance.timeout) return

		clearTimeout(e.detail.instance.timeout)
		e.detail.instance.timeout = null
	}

	#handleDragend = (e: DragEndEvent<Notification, 'y'>) => {
		const notif = e.detail.instance

		if (e.detail.thresholdPassed!.y || (!e.detail.isInView.topLeft && !e.detail.isInView.topRight)) {
			this.#destroyNotif(notif)
		} else {
			this.#setNotifTimeout(notif)
		}
	}
	// todo это слой в ui
	#addListeners(notif: Notification) {
		notif.element.addEventListener('notifDestroyed', this.#handleDestroyed)
		notif.element.addEventListener('dragstart', this.#handleDragstart)
		notif.element.addEventListener('dragend', this.#handleDragend)
	}

	#removeListeners(notif: Notification) {
		notif.element.removeEventListener('notifDestroyed', this.#handleDestroyed)
		notif.element.removeEventListener('dragstart', this.#handleDragstart)
		notif.element.removeEventListener('dragend', this.#handleDragend)
	}
}
