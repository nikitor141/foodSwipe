import { Product } from '@/api/products-fetcher.service.ts'

export type WishListNormalized = number[]
export type WishListRuntime = Set<Product>
