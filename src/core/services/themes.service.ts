import { StorageService } from './storage.service'

export class ThemesService {
	storage = new StorageService()
	darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
	dataset = document.documentElement.dataset

	constructor() {
		this.darkThemeMq.onchange = () => this.updateTheme()
		this.updateTheme()
	}

	updateTheme = (newTheme = this.storage.getItem('theme') || this.getSystemTheme()) => {
		this.dataset.theme = newTheme
	}

	getSystemTheme() {
		return this.darkThemeMq.matches ? 'dark' : 'light'
	}

	//todo сброс к системной теме по кнопке и переключение тем
}

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
