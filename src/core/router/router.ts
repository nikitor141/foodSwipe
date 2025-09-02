import { NotificationService } from '@core/services/notification.service'
import { Layout } from '@/components/layout/layout.component'
import { MESSAGE_REDIRECTED } from '@/constants/messages.constants'
import { HOME_URL } from '@/constants/routes.constants'
import { Singleton } from '@/utils/singleton'
import { BaseScreenConstructor } from '../component/base-screen.component'
import { ROUTES } from './routes.data'

export class Router extends Singleton {
	#routes: Record<string, BaseScreenConstructor> = ROUTES
	#currentRoute!: BaseScreenConstructor
	#layout: Layout = Layout.instance
	#notificationService: NotificationService = NotificationService.instance

	protected constructor() {
		super()

		window.addEventListener('popstate', () => {
			this.#handleRouteChange()
		})

		this.#handleRouteChange()
		this.#handleLinks()
	}

	getCurrentPath(): string {
		return location.pathname
	}

	#isExternalLink(path: string): boolean {
		try {
			return new URL(path, location.origin).hostname !== location.hostname
		} catch (e) {
			return false
		}
	}

	navigate(path: string): void {
		if (path === this.getCurrentPath()) return

		history.pushState({}, '', path)
		this.#handleRouteChange()
	}

	#handleRouteChange(): void {
		const path: string = this.getCurrentPath()

		this.#currentRoute = this.#routes[path]

		if (!this.#currentRoute) {
			this.navigate(HOME_URL)
			this.#notificationService.show(MESSAGE_REDIRECTED, 'negative')
			return
		}

		this.#render()
	}

	#handleLinks(): void {
		document.addEventListener('click', (e: PointerEvent) => {
			const target = e.target as HTMLElement | null

			const link = target?.closest<HTMLAnchorElement>('a')
			if (!link || this.#isExternalLink(link.href)) return

			e.preventDefault()
			this.navigate(link.href)
		})
	}

	#render(): void {
		this.#layout.setScreen(this.#currentRoute)
	}
}
