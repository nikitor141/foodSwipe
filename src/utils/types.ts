export type AtLeastOneInObject<T> = {
	[K in keyof T]: Pick<T, K> & Partial<Omit<T, K>>
}[keyof T]

export type AtLeastOneInArray<T> = [T, ...T[]]
