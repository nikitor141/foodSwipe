export function getAsObject(map: Map<any, any> | object): {} {
	const obj = {}
	if (map instanceof Map) {
		for (let [key, value] of map) {
			obj[key] = value instanceof Map ? getAsObject(value) : value instanceof Set ? Array.from(value) : value
		}
	}
	if (typeof map === 'object') {
		for (let key in map) {
			const value = map[key]
			obj[key] = value instanceof Map ? getAsObject(value) : value instanceof Set ? Array.from(value) : value
		}
	}
	return obj
}
