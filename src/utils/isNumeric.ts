export const isNumeric = (num: any) => {
	return typeof num === 'string' && num.trim() !== '' ? Number.isFinite(+num) : Number.isFinite(num)
}
