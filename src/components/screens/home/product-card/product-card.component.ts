import { RenderService } from '@core/services/render.service'
import { ProductsService } from '@/api/products.service'
import { Component } from '@/core/component/component'
import styles from './product-card.module.scss'
import template from './product-card.template.html?raw'

export class ProductCard implements Component {
	element: HTMLElement
	renderService: RenderService = RenderService.instance
	productsService: ProductsService = ProductsService.instance

	render(): HTMLElement {
		this.element = this.renderService.htmlToElement(template, [], styles) as HTMLElement

		return this.element
	}
}
