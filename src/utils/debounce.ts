export function debounce(fn: (...args: any[]) => void, ms: number): (...args: any[]) => void {
	let timeoutId: ReturnType<typeof setTimeout>

	return function (...args) {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => fn.apply(this, args), ms)
	}
}
export function debounceProxy(fn: (...args: any[]) => void, ms: number) {
	let timeoutId: ReturnType<typeof setTimeout>

	return new Proxy(fn, {
		apply(...args) {
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => Reflect.apply(...args), ms)
		}
	})
}
