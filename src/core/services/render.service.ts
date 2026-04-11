import { ComponentConstructor } from '@/core/component/component'
import { imgToPicture } from '@/utils/imgToPicture'
import { isNumeric } from '@/utils/isNumeric'
import { Singleton } from '@/utils/singleton'

export class RenderService extends Singleton {
	protected constructor() {
		super()
	}

	htmlToElement(
		html: string,
		components: ComponentConstructor[],
		styles: CSSModuleClasses
	): Element | HTMLElement | SVGElement {
		const template = document.createElement('template')
		template.innerHTML = html.trim()

		if (template.content.children.length > 1) throw new Error('HTML template must have a single root element')
		const rootElement: Element = template.content.firstElementChild!

		if (styles) this.#applyModuleStyles(styles, rootElement)

		this.#replaceSpecialTags(rootElement)
		this.#replaceComponentTags(rootElement, components)

		return rootElement
	}

	#replaceSpecialTags(rootElement: Element) {
		const imgElements: NodeListOf<HTMLImageElement> = rootElement.querySelectorAll('img[data-src]')

		for (const img of imgElements) {
			img.replaceWith(imgToPicture(img))
		}
	}

	#replaceComponentTags(rootElement: Element, components: ComponentConstructor[]) {
		const componentTagPattern = /^component-/
		const allChildrenElements = rootElement.querySelectorAll('*')

		for (const element of Array.from(allChildrenElements)) {
			const elementTagName = element.tagName.toLowerCase()
			if (!componentTagPattern.test(elementTagName)) continue

			const foundComponent = components.find(component => component.componentName === elementTagName)
			if (!foundComponent) continue

			let attributes: Record<string, unknown> = {}
			for (const attr of element.attributes) {
				if (attr.name === 'class') continue
				attributes[attr.name] = isNumeric(attr.value) ? +attr.value : attr.value
			}

			const componentContent = new foundComponent(attributes).render()
			element.replaceWith(componentContent)
		}
	}

	#applyModuleStyles(moduleStyles: CSSModuleClasses, rootElement: Element) {
		const allChildrenElements = rootElement.querySelectorAll('*')
		applyStyles(rootElement)
		allChildrenElements.forEach(applyStyles)

		function applyStyles(element: Element) {
			for (const [key, value] of Object.entries(moduleStyles)) {
				element.classList.replace(key, value)
			}
		}
	}
}
