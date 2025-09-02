import { Singleton } from '@utils/singleton'

export class StorageService extends Singleton {
	protected constructor() {
		super()
	}

	getItem(key: string) {
		const value = localStorage.getItem(key)
		return value ?? JSON.parse(value)
	}

	setItem(key: string, value: any): void {
		localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
	}

	removeItem(key: string): void {
		localStorage.removeItem(key)
	}

	clear(): void {
		localStorage.clear()
	}
}
