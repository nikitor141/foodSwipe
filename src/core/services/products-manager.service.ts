import { ProductCard } from '@components/screens/home/products/product-card/product-card.component.ts'
import { DragCustomEvent } from '@core/services/drag.service.ts'
import { NotificationService } from '@core/services/notification.service.ts'
import { Singleton } from '@utils/singleton.ts'
import { Excluded, Product, ProductsService } from '@/api/products.service.ts'

interface Listener {
	refill(type: 'add' | 'delete', product: Product): void
}
interface ExcludedProduct {
	id: Product['id']
	cat: Product['categoryId']
	subCat: Product['subcategoryId']
}

export class ProductsManagerService extends Singleton {
	productsService: ProductsService = ProductsService.instance
	notificationService: NotificationService = NotificationService.instance

	#limit: number = 3
	#packetSize: number = 25
	#queue: Set<Product> = new Set()
	#active: Set<Product> = new Set()
	#listeners: Set<Listener> = new Set()

	#productCardsByProduct: WeakMap<Product, ProductCard> = new WeakMap()
	#productsExcluded: Map<Product['id'], ExcludedProduct> = new Map()
	#subcategoriesExcluded: Map<
		ExcludedProduct['subCat'],
		{ subCat: ExcludedProduct['subCat']; cat: ExcludedProduct['cat'] }
	> = new Map()
	#subcategoriesByCategory: Map<number, Set<number>> = new Map()
	#categoriesExcluded: Set<ExcludedProduct['cat']> = new Set()
	#subcategoryCounter: Map<ExcludedProduct['subCat'], { products: Set<ExcludedProduct['id']> }> = new Map()
	#categoryCounter: Map<ExcludedProduct['cat'], { subCats: Set<ExcludedProduct['subCat']> }> = new Map()

	protected constructor() {
		super()
		void this.#fill()
	}

	getActive() {
		return this.#active
	}

	subscribe(listener: Listener) {
		this.#listeners.add(listener)
	}
	addProductCard(product: Product, productCard: ProductCard): void {
		this.#productCardsByProduct.set(product, productCard)
	}

	swipe(productCard: ProductCard, direction: DragCustomEvent['detail']['direction']) {
		if (direction === 'left') {
			this.#produceExclude(productCard)
		}
		this.#active.delete(productCard.product)
		productCard.destroy()

		if (this.#queue.size <= this.#limit) void this.#refill()

		this.#refillActive()
	}

	#produceExclude(productCard: ProductCard) {
		const { id, subcategoryId: subCat, categoryId: cat } = productCard.product

		// Рабочий костыль.
		//
		// // Если категория уже исключена — удаляем продукт и выходим
		// if (this.#categoriesExcluded.has(cat)) {
		// 	this.#productsExcluded.delete(id) // на всякий случай
		// 	return
		// }
		//
		// // Если подкатегория уже исключена — тоже можно удалить и выйти (опционально)
		// if (this.#subcategoriesExcluded.has(subCat)) {
		// 	this.#productsExcluded.delete(id)
		// 	return
		// }

		// Записываем продукт в id индекс
		this.#productsExcluded.set(id, { id, subCat, cat })

		// Записываем подкатегорию в cat индекс
		if (!this.#subcategoriesByCategory.has(cat)) this.#subcategoriesByCategory.set(cat, new Set())
		this.#subcategoriesByCategory.get(cat).add(subCat)

		// Считаем подкатегории
		if (!this.#subcategoryCounter.has(subCat)) this.#subcategoryCounter.set(subCat, { products: new Set() })

		const subCatCounter = this.#subcategoryCounter.get(subCat)
		subCatCounter.products.add(id)

		// Проверяем количество товаров
		if (this.#subcategoryCounter.get(subCat).products.size !== 5) return

		// Удаляем все продукты этой подкатегории
		this.#clearProductsBySubcategory(subCat)

		// Записываем подкатегорию в subCat индекс
		this.#subcategoriesExcluded.set(subCat, { subCat, cat })

		// Считаем категории
		if (!this.#categoryCounter.has(cat)) this.#categoryCounter.set(cat, { subCats: new Set() })

		const catCounter = this.#categoryCounter.get(cat)
		catCounter.subCats.add(subCat)

		// Проверяем количество подкатегорий
		if (catCounter.subCats.size !== 2) return

		// Очищаем все подкатегории и продукты категории
		this.#clearSubcategoriesByCategory(cat)
	}

	#clearProductsBySubcategory(subCat: number) {
		// Удаляем из счетчика (если есть)
		const subCatData = this.#subcategoryCounter.get(subCat)
		if (subCatData) {
			for (const productId of subCatData.products) {
				this.#productsExcluded.delete(productId)
			}
			this.#subcategoryCounter.delete(subCat)
		}

		// 🔥 Удаляем ВСЕ оставшиеся продукты этой подкатегории из #productsExcluded
		for (const [productId, productData] of this.#productsExcluded.entries()) {
			if (productData.subCat === subCat) {
				this.#productsExcluded.delete(productId)
			}
		}

		// Удаляем из очереди и активных
		// Из-за мутаций во время итераций подстраховался
		for (const p of Array.from(this.#queue)) {
			if (p.subcategoryId === subCat) {
				this.#queue.delete(p)
			}
		}

		let activeWasFiltered = false
		for (const p of Array.from(this.#active)) {
			if (p.subcategoryId === subCat) {
				this.#active.delete(p)
				this.#productCardsByProduct.get(p).destroy()
				activeWasFiltered = true
			}
		}

		if (activeWasFiltered) this.#refillActive()
	}

	#clearSubcategoriesByCategory(cat: number) {
		// 1. Удаляем подкатегории, которые были явно закрыты (через categoryCounter)
		const catData = this.#categoryCounter.get(cat)
		if (catData) {
			for (const subCat of catData.subCats) {
				this.#subcategoriesExcluded.delete(subCat)
				this.#clearProductsBySubcategory(subCat)
			}
			this.#categoryCounter.delete(cat)
		}

		// 2. 🔥 Удаляем ВСЕ подкатегории, которые вообще встречались в этой категории
		const allSubCats = this.#subcategoriesByCategory.get(cat)
		if (allSubCats) {
			for (const subCat of allSubCats) {
				// Удаляем подкатегорию из исключённых (если вдруг там была)
				this.#subcategoriesExcluded.delete(subCat)
				// Удаляем ВСЕ её продукты (даже если она не была "закрыта")
				this.#clearProductsBySubcategory(subCat)
			}
			// Удаляем саму запись категории
			this.#subcategoriesByCategory.delete(cat)
		}

		// 3. Удаляем из очереди и активных
		// Из-за мутаций во время итераций подстраховался
		for (const p of Array.from(this.#queue)) {
			if (p.categoryId === cat) {
				this.#queue.delete(p)
			}
		}
		let activeWasFiltered = false
		for (const p of Array.from(this.#active)) {
			if (p.categoryId === cat) {
				this.#active.delete(p)
				this.#productCardsByProduct.get(p).destroy()
				activeWasFiltered = true
			}
		}
		if (activeWasFiltered) this.#refillActive()

		// 4. Добавляем категорию в исключённые
		this.#categoriesExcluded.add(cat)
	}

	getExcluded(): Excluded {
		return {
			categories: Array.from(this.#categoriesExcluded),
			subcategories: Array.from(this.#subcategoriesExcluded.keys()),
			products: Array.from(this.#productsExcluded.keys())
		}
	}

	async #requestProducts(): Promise<Product[]> {
		try {
			const countToFill = this.#packetSize - this.#queue.size
			if (!countToFill) return []

			return await this.productsService.getRandomProducts(countToFill, this.getExcluded())
		} catch (err) {
			this.notificationService.show(err.message ?? 'Ошибка загрузки', 'negative')
			return []
		}
	}

	async #fill() {
		const products: Product[] = await this.#requestProducts()

		for (const product of products) {
			if (this.#active.size < this.#limit) {
				this.#active.add(product)
				this.#notify('add', product)
				continue
			}

			this.#queue.add(product)
		}
	}
	#refillActive() {
		const nextProduct = this.#queue.values().next().value
		if (!nextProduct) return
		this.#queue.delete(nextProduct)

		if (this.#active.size === this.#limit) return

		this.#active.add(nextProduct)
		this.#notify('add', nextProduct)
	}

	async #refill() {
		const products: Product[] = await this.#requestProducts()

		for (const product of products) {
			this.#queue.add(product)
		}
	}

	#notify(...args: Parameters<Listener['refill']>) {
		for (const listener of this.#listeners) {
			listener.refill(...args)
		}
	}
}
