import { Singleton } from '@utils/singleton'
import { StorageService } from './storage.service'

/*
	const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
	const dataset = document.documentElement.dataset
	let currentTheme

	darkThemeMq.addEventListener('change', () => setTheme())
	setTheme()

	document.addEventListener('click', e => {
		if (e.target.closest('._themeSwitcher')) {
			darkThemeMq.removeEventListener('change', () => setTheme())
			switchTheme()
		}
		if (e.target.closest('._themeDefault')) {
			localStorage.removeItem('theme')
			darkThemeMq.addEventListener('change', () => setTheme())
			setTheme()
		}
	})

	function setTheme(newTheme) {
		if (!newTheme) {
			newTheme = localStorage.getItem('theme') || (darkThemeMq.matches ? 'dark' : 'light')
		}
		dataset.theme = newTheme
		currentTheme = newTheme
	}

	function switchTheme() {
		currentTheme = currentTheme === 'light' ? 'dark' : 'light'
		localStorage.setItem('theme', currentTheme)
		setTheme(currentTheme)
	}
*/

export class ThemesService extends Singleton {
	storage: StorageService = StorageService.instance
	darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
	dataset = document.documentElement.dataset
	#defaultThemes = ['dark', 'light', 'system']
	#currentIndex = 0

	protected constructor() {
		super()
	}

	init(): void {
		this.darkThemeMq.onchange = () => {
			if (this.#getSavedTheme() !== 'system') return

			this.#applyTheme(this.#getSystemTheme())
		}

		const saved: string = this.storage.getItem('theme') || 'system'
		const theme: string = saved === 'system' ? this.#getSystemTheme() : saved

		this.#currentIndex = this.#defaultThemes.indexOf(saved)
		this.#applyTheme(theme)
	}

	toggleTheme() {
		this.#currentIndex = (this.#currentIndex + 1) % this.#defaultThemes.length

		const next = this.#defaultThemes[this.#currentIndex]
		const theme = next === 'system' ? this.#getSystemTheme() : next

		this.storage.setItem('theme', next)
		this.#applyTheme(theme)
	}

	#applyTheme(theme: string): void {
		this.dataset.theme = theme
	}

	#getSavedTheme(): string {
		return this.storage.getItem('theme') || 'system'
	}

	#getSystemTheme(): string {
		return this.darkThemeMq.matches ? 'dark' : 'light'
	}
}
