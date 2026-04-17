import { Product } from '@/api/products-fetcher.service.ts'
import { DynamicComponent } from '@/core/component/component.ts'
import { DragService } from '@/core/services/drag.service.ts'
import { DragConfig, DragEndEvent, DragMoveEvent } from '@/core/services/drag.types'
import { ProductsManagerService } from '@/core/services/products-manager.service.ts'
import { RenderService } from '@/core/services/render.service.ts'
import { imgToPicture } from '@/utils/imgToPicture'

import styles from './product-card.module.scss'
import template from './product-card.template.html?raw'

export class ProductCard implements DynamicComponent {
	static componentName = 'component-product-card'
	static #instancesByElement = new WeakMap<HTMLElement, ProductCard>()

	static from(element: HTMLElement) {
		return this.#instancesByElement.get(element)
	}

	element: HTMLElement | null = null
	renderService: RenderService = RenderService.instance
	dragService: DragService = DragService.instance
	productsManagerService: ProductsManagerService = ProductsManagerService.instance
	product: Product
	inactiveLink: boolean
	draggable: boolean
	isDestroying: boolean = false

	dragConfig: DragConfig = {
		componentInstance: this,
		direction: 'horizontal',
		threshold: 75,
		resistance: 5,
		snap: { animation: true, forwards: true }
	}

	constructor(product: Product, config: { inactiveLink: boolean; draggable: boolean }) {
		this.product = product
		this.inactiveLink = config.inactiveLink
		this.draggable = config.draggable
	}

	#handleDragMove = (e: DragMoveEvent<this, 'x'>) => {
		if (!this.element) return
		const dx = e.detail.elementDelta.center.x

		const t = Math.min(1, Math.abs(dx) / this.dragConfig.threshold!)

		if (dx > 0) {
			// positive swipe
			this.element.style.setProperty('--card-gradient-negative-opacity', `${lerp(0.1, 0, t)}`)
			this.element.style.setProperty('--card-gradient-positive-opacity', `${lerp(0.1, 0.4, t)}`)
			this.element.style.setProperty('--card-gradient-positive-end', `${lerp(60, 100, t)}%`)
		} else {
			// negative swipe
			this.element.style.setProperty('--card-gradient-positive-opacity', `${lerp(0.1, 0, t)}`)
			this.element.style.setProperty('--card-gradient-negative-opacity', `${lerp(0.1, 0.4, t)}`)
			this.element.style.setProperty('--card-gradient-negative-end', `${lerp(80, 100, t)}%`)
		}

		this.element.style.rotate = dx * 0.05 + 'deg'
		this.element.style.opacity = `${lerp(1, 0.9, t)}`

		function lerp(start: number, end: number, t: number) {
			return start + (end - start) * t
		}
	}

	#handleDragend = (e: DragEndEvent<this, 'x'>) => {
		if (!this.element) return

		this.element.style.removeProperty('--card-gradient-negative-opacity')
		this.element.style.removeProperty('--card-gradient-positive-opacity')
		this.element.style.removeProperty('--card-gradient-positive-end')
		this.element.style.removeProperty('--card-gradient-negative-end')

		if (!e.detail.thresholdPassed?.x && this.element) {
			this.element.style.removeProperty('rotate')
			this.element.style.removeProperty('opacity')
		} else {
			this.productsManagerService.swipe(e.detail.instance.product, e.detail.direction)
		}
	}

	#addListenersRequiredReadyDOM() {
		if (!this.element) return
		this.dragService.attach(this.element, this.dragConfig)
	}

	#addListeners() {
		if (!this.element) return
		this.element.addEventListener('dragmove', this.#handleDragMove)
		this.element.addEventListener('dragend', this.#handleDragend)
	}

	mount(parent: HTMLElement, method: 'append' | 'prepend') {
		if (!this.element) this.element = this.render()

		ProductCard.#instancesByElement.set(this.element, this)

		parent[method](this.element)

		if (!this.draggable) return

		requestAnimationFrame(() => {
			if (!this.element || this.isDestroying) return
			this.#addListenersRequiredReadyDOM()
		})
	}

	destroy(direction?: DragEndEvent<this, 'x'>['detail']['direction']) {
		if (this.isDestroying || !this.element) return
		this.isDestroying = true

		const clear = () => {
			if (!this.element) return

			if (this.draggable) {
				this.dragService.detach(this.element)
			}
			this.element.onanimationend = null
			this.element.remove()
			this.element = null
		}

		if (direction?.x) {
			this.element.classList.add(styles[`product-card--vanishing-${direction.x}`]!)
			this.element.onanimationend = clear
		} else {
			clear()
		}
	}

	render() {
		this.element = this.renderService.htmlToElement(template, [], styles)

		const subcategoryEl = this.element.querySelector<HTMLSpanElement>(`.${styles['product-card__tag-subcategory']}`)!
		const categoryEl = this.element.querySelector<HTMLSpanElement>(`.${styles['product-card__tag-category']}`)!
		const nameLinkEl = this.element.querySelector<HTMLAnchorElement>(`.${styles['product-card__name']} a`)!
		const imgLinkEl = this.element.querySelector<HTMLAnchorElement>(`.${styles['product-card__image']}`)!
		const priceMainEl = this.element.querySelector<HTMLSpanElement>(`.${styles['product-card__price']} span`)!
		const pricePennyEl = this.element.querySelector<HTMLElement>(`.${styles['product-card__price']} sup`)!
		const imgEl: HTMLImageElement = imgLinkEl.querySelector<HTMLImageElement>('img')!

		const price = this.product.price.toString().split('.')
		const priceMain = price[0]!
		const pricePenny = price[1]!

		subcategoryEl.textContent = this.product.subcategory_name
		categoryEl.textContent = this.product.category_name
		nameLinkEl.textContent = this.product.name
		nameLinkEl.title = this.product.name

		if (!this.inactiveLink) {
			nameLinkEl.href = this.product.url
			imgLinkEl.href = this.product.url
		}

		priceMainEl.textContent = priceMain
		pricePennyEl.textContent = pricePenny
		imgEl.src = this.product.image
		imgEl.alt = this.product.name
		imgEl.onerror = () => {
			imgEl.dataset['src'] = '/src/assets/img/background/mascot-placeholder.png'
			imgEl.replaceWith(imgToPicture(imgEl))
		}

		this.#addListeners()

		return this.element
	}
}
