export const isNumeric = (num: any): boolean => {
	return typeof num === 'string' && num.trim() !== '' ? Number.isFinite(+num) : Number.isFinite(num)
}
