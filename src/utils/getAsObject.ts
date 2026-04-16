export function getAsObject(item: Map<unknown, unknown> | object) {
	const obj: Record<string, unknown> = {}
	const iterable: Iterable<[any, unknown]> =
		Symbol.iterator in item ? (item as Iterable<[unknown, unknown]>) : Object.entries(item)

	for (let [key, value] of iterable) {
		obj[key] = convertValue(value)
	}
	return obj
}

function convertValue(value: unknown): unknown {
	if (value instanceof Map) return getAsObject(value)
	if (value instanceof Set) return Array.from(value, convertValue)
	if (Array.isArray(value)) return value.map(convertValue)
	return value
}
