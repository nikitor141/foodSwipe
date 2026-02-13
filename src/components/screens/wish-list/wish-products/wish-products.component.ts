import { ProductCard } from '@components/screens/home/products/product-card/product-card.component.ts'
import { WishList } from '@components/screens/wish-list/wish-list.component.ts'
import { Component } from '@core/component/component'
import { ObserverService } from '@core/services/observer.service.ts'
import { ProductsManagerEvent, ProductsManagerService } from '@core/services/products-manager.service.ts'
import { RenderService } from '@core/services/render.service'
import styles from './wish-products.module.scss'
import template from './wish-products.template.html?raw'

export class WishProducts implements Component {
	element: HTMLElement
	productsListEl!: HTMLElement
	renderService: RenderService = RenderService.instance
	productsManagerService: ProductsManagerService = ProductsManagerService.instance
	observerService: ObserverService = ObserverService.instance

	constructor() {
		this.observerService.subscribe(this, [this.productsManagerService], WishList)
		// при загрузке приложения на этом экране ждем событие от productsManager для заполнения
	}

	update({ type, data }: ProductsManagerEvent) {
		switch (type) {
			case 'products-manager-ready':
				this.#fill()
		}
	}

	#fill() {
		for (const product of this.productsManagerService.getWishListRuntime()) {
			new ProductCard(product, { inactiveLink: false, draggable: false }).mount(this.productsListEl, 'prepend')
		}
	}

	render(): HTMLElement {
		this.element = this.renderService.htmlToElement(template, [], styles) as HTMLElement
		this.productsListEl = this.element.querySelector('ul')
		if (this.productsManagerService.isReady()) this.#fill()

		return this.element
	}
}
