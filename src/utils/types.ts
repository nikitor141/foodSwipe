export type AtLeastOneInObject<T> = {
	[K in keyof T]: Pick<T, K> & Partial<Omit<T, K>>
}[keyof T]

export type AtLeastOneInArray<T> = [T, ...T[]]

export type Entries<T> = { [K in keyof T]-?: [K, NonNullable<T[K]>] }[keyof T][]
