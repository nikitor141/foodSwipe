import { Singleton } from '@/utils/singleton'

export class StorageService extends Singleton {
	protected constructor() {
		super()
	}

	getAll() {
		if (localStorage.length === 0) return null

		const result: Record<string, unknown> = {}
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i)

			result[key] = this.getItem(key)
		}
		return result
	}

	getItem(key: string) {
		const value = localStorage.getItem(key)

		try {
			return JSON.parse(value)
		} catch {
			return value ?? null
		}
	}

	setItem(key: string, value: any) {
		localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
	}

	removeItem(key: string) {
		localStorage.removeItem(key)
	}

	clear() {
		localStorage.clear()
	}
}
