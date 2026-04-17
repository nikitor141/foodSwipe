import { Product } from '@/api/products-fetcher.service.ts'
import { Home } from '@/components/screens/home/home.component.ts'
import { ProductCard } from '@/components/screens/home/products/product-card/product-card.component.ts'
import { NoData } from '@/components/ui/no-data/no-data.component'
import { StaticComponent } from '@/core/component/component'
import { ObserverService } from '@/core/services/observer.service.ts'
import { ProductsManagerEvent, ProductsManagerService } from '@/core/services/products-manager.service.ts'
import { RenderService } from '@/core/services/render.service'

import styles from './products.module.scss'
import template from './products.template.html?raw'

export class Products implements StaticComponent {
	static componentName = 'component-products'

	element!: HTMLElement
	#productsListElement!: HTMLUListElement
	renderService: RenderService = RenderService.instance
	#productsManagerService: ProductsManagerService = ProductsManagerService.instance
	#observerService: ObserverService = ObserverService.instance

	#productCardsByProduct = new WeakMap<Product, ProductCard>()
	#placeholder: NoData | null = null

	constructor() {
		this.#observerService.subscribe(this, [this.#productsManagerService], Home)
	}

	#fill() {
		const active = this.#productsManagerService.getActive()
		if (!active.size) {
			this.#handleNoData()
			return
		}

		for (const product of active) {
			this.update({ type: 'products-active-add', data: { product } })
		}
	}

	#handleNoData() {
		if (this.#placeholder) return

		this.#placeholder = new NoData()
		this.#placeholder.mount(this.#productsListElement, 'append')
	}

	update({ type, data }: ProductsManagerEvent) {
		switch (type) {
			case 'products-active-add': {
				if (this.#placeholder) {
					this.#placeholder.destroy()
					this.#placeholder = null
				}

				const productCard = new ProductCard(data.product, {
					inactiveLink: true,
					draggable: true
				})
				productCard.mount(this.#productsListElement, 'prepend')

				this.#productCardsByProduct.set(data.product, productCard)
				break
			}
			case 'products-active-delete': {
				this.#productCardsByProduct.get(data.product)?.destroy(data.direction)
				this.#productCardsByProduct.delete(data.product)
				break
			}
			case 'products-response-zero-products': {
				this.#handleNoData()
				break
			}

			// удалять product из productCard не имеет смысла, ибо productCard и так не доступен,
			// если нет ссылки на product

			// при свайпе вправо ссылка на product сохраняется в wishList,
			// поэтому GC не чистит weakMap
		}
	}

	render() {
		this.element = this.renderService.htmlToElement(template, [], styles)
		this.#productsListElement = this.element.querySelector('#products__list')!

		// Если данные уже загружали, то при повторном рендере компонента заполняем его
		if (this.#productsManagerService.isReady()) this.#fill()
		return this.element
	}
}
