import { ScreenSingleton } from '@core/component/base-screen.types.ts'
import { StorageService } from '@core/services/storage.service.ts'
import { StateItems } from '@core/store/store.types.ts'
import { debounce } from '@utils/debounce.ts'
import { INITIAL_STATE } from '@/config/state.config.ts'
import { Singleton } from '@/utils/singleton'

interface Observer {
	update(): void
	onScreenChange?(): void
}
interface ObserversStore {
	byScreen: Map<ScreenSingleton, Set<Observer>>
	independent: Set<Observer>
}

export class Store extends Singleton {
	storageService: StorageService = StorageService.instance
	#observers: ObserversStore = {
		byScreen: new Map(),
		independent: new Set()
	}
	#state: StateItems = (this.storageService.getAll() as StateItems) ?? INITIAL_STATE

	protected constructor() {
		super()
	}
	init(): void {
		this.#saveState()
	}

	#saveState() {
		for (const [key, value] of Object.entries(this.state)) {
			if (key === 'screen') continue

			this.storageService.setItem(key, value)
		}
	}

	#saveStateDebounced = debounce(this.#saveState.bind(this), 1000)

	updateState<K extends keyof StateItems>(key: K, value: StateItems[K]): void {
		if (this.state[key] === value) return

		this.#saveStateDebounced() // выполнится позже, планируем раньше.

		this.#stateProxy[key] = value
	}

	#stateProxy = new Proxy(this.#state, {
		set: (target, property, newValue) => {
			const success = Reflect.set(target, property, newValue)
			if (success) {
				if (property === 'screen') {
					this.#notify()
					this.#notifyScreenChange()
				} else {
					this.#notify()
				}

				// property === 'screen' ? this.#notifyScreenChange() : this.#notify()
			}
			return success
		}
	})

	set state(value: any) {
		throw new Error('Cannot set state bypassing Store!')
	}
	get state(): Readonly<StateItems> {
		return this.#state
	}

	#notifyScreenChange() {
		const previousScreen = this.state.screen.previous
		if (!previousScreen || !this.#observers.byScreen.size) return

		const observersToNotify = this.#observers.byScreen.get(previousScreen)
		if (!observersToNotify) return

		for (const observer of observersToNotify) {
			observer.onScreenChange?.()
		}
	}

	#notify(): void {
		for (const observer of this.#observers.independent) {
			observer.update()
		}

		if (!this.#observers.byScreen.size) return

		const currentScreen = this.state.screen.current
		const byScreenObserversToNotify = this.#observers.byScreen.get(currentScreen)
		if (!byScreenObserversToNotify) return

		for (const observer of byScreenObserversToNotify) {
			observer.update()
		}
	}

	addObserver(observer: Observer, screen?: ScreenSingleton) {
		if (!screen) {
			this.#observers.independent.add(observer)
			return
		}

		if (!this.#observers.byScreen.has(screen)) {
			this.#observers.byScreen.set(screen, new Set())
		}
		this.#observers.byScreen.get(screen).add(observer)
	}

	removeObserver(observer: Observer, screen?: ScreenSingleton) {
		if (!screen) {
			this.#observers.independent.delete(observer)
			return
		}

		this.#observers.byScreen.get(screen).delete(observer)
	}
}
