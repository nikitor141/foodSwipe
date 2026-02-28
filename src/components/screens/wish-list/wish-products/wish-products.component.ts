import { ProductCard } from '@components/screens/home/products/product-card/product-card.component.ts'
import { WishList } from '@components/screens/wish-list/wish-list.component.ts'
import { Checkbox } from '@components/ui/checkbox/checkbox.component.ts'
import { Component } from '@core/component/component'
import { ObserverService } from '@core/services/observer.service.ts'
import { ProductsManagerEvent, ProductsManagerService } from '@core/services/products-manager.service.ts'
import { RenderService } from '@core/services/render.service'
import { Product } from '@/api/products-fetcher.service.ts'
import styles from './wish-products.module.scss'
import template from './wish-products.template.html?raw'

export class WishProducts implements Component {
	element: HTMLElement
	productsListEl!: HTMLElement
	clearBtn!: HTMLElement
	renderService: RenderService = RenderService.instance
	productsManagerService: ProductsManagerService = ProductsManagerService.instance
	observerService: ObserverService = ObserverService.instance

	#productCardsByProduct: Map<Product, ProductCard> = new Map()

	constructor() {
		this.observerService.subscribe(this, [this.productsManagerService], WishList)
		// при загрузке приложения на этом экране ждем событие от productsManager для заполнения
	}

	update({ type, data }: ProductsManagerEvent) {
		switch (type) {
			case 'products-manager-ready':
				this.#fill()
				break
			case 'wish-list-removed':
				this.#productCardsByProduct.get(data.product).destroy()
				this.#productCardsByProduct.delete(data.product)
				break
			case 'wish-list-cleared':
				for (const productCard of this.#productCardsByProduct.values()) {
					productCard.destroy()
				}
				this.#productCardsByProduct.clear()
				break
		}
	}

	#addListeners() {
		this.clearBtn.addEventListener('click', () => {
			this.productsManagerService.wishList.clear()
		})

		this.element.oncontextmenu = e => {
			e.preventDefault()
		}
		document.oncontextmenu ??= e => {
			if (e.defaultPrevented) return
		}

		let timerId
		this.element.onpointerdown = e => {
			timerId = setTimeout(() => {
				for (const productCard of this.#productCardsByProduct.values()) {
					// const checkbox = new Checkbox(false, {})
				}
			}, 1000)
		}
		this.element.onpointerup =
			this.element.onpointercancel =
			this.element.onpointerleave =
				() => {
					clearTimeout(timerId)
				}
	}

	#fill() {
		for (const product of this.productsManagerService.wishList.getRuntime()) {
			const productCard = new ProductCard(product, { inactiveLink: false, draggable: false })
			productCard.mount(this.productsListEl, 'prepend')
			this.#productCardsByProduct.set(product, productCard)
		}
	}

	render(): HTMLElement {
		this.element = this.renderService.htmlToElement(template, [], styles) as HTMLElement
		this.productsListEl = this.element.querySelector(`.${styles['wish-products__list']}`)
		this.clearBtn = this.element.querySelector(`.${styles['wish-products__clear-button']}`)
		if (this.productsManagerService.isReady()) this.#fill()

		this.#addListeners()

		return this.element
	}
}
