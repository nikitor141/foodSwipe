import { Component } from '@core/component/component.ts'
import { Singleton } from '@utils/singleton.ts'
import { AtLeastOneInArray, AtLeastOneInObject } from '@utils/types'

export interface DragConfig {
	direction: 'horizontal' | 'vertical' | 'both'
	componentInstance: Component
	threshold?: number // минимальное расстояние для срабатывания
	resistance?: number // сопротивление при перетаскивании
	snap?: { animation: boolean; forwards: boolean } // возврат на место|анимировать?|не сбрасывать стили после прохождения threshold?
	bounds?: { rect: DOMRect; sides: AtLeastOneInArray<'top' | 'right' | 'bottom' | 'left'> } // ограничения движения
	handles?: HTMLElement[] // элементы-ручка
}

interface InitialGeomerty {
	width: number
	height: number
	left: number
	top: number
	center: {
		x: number
		y: number
	}
}

export type DragCustomEvent<T extends Component = Component> = CustomEvent<{
	instance: T
	thresholdPassed: { x?: boolean; y?: boolean }
	isInView: { topLeft: boolean; topRight: boolean; bottomLeft: boolean; bottomRight: boolean }
	elementDelta: { x: number; y: number; center: { x: number; y: number } }
	direction: { x?: 'left' | 'right' | undefined; y?: 'up' | 'down' | undefined }
}>

export class DragService extends Singleton {
	#onPointerDown!: (e: PointerEvent) => void

	protected constructor() {
		super()
	}

	attach(element: HTMLElement, config: DragConfig) {
		//setting default values
		config.threshold ??= 0
		// config.resistance ??= 0

		const rect = element.getBoundingClientRect()
		//todo? initialGeometry высчитывать в другом месте?
		const initialGeometry: InitialGeomerty = {
			width: rect.width,
			height: rect.height,
			left: rect.left,
			top: rect.top,
			center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
		}

		this.#onPointerDown = e => {
			if (config.handles) {
				const target = e.target as Node
				const canDrag = config.handles.some(handle =>
					handle !== element ? handle.contains(target) : target === element
				)

				if (!canDrag) return
			}

			this.#handleDrag(element, config, initialGeometry, e)
		}

		element.addEventListener('pointerdown', this.#onPointerDown, { passive: true })
	}

	detach(element: HTMLElement) {
		element.removeEventListener('pointerdown', this.#onPointerDown)
	}

	#handleDrag(
		element: HTMLElement,
		config: DragConfig,
		initialGeometry: { width: number; height: number; left: number; top: number; center: { x: number; y: number } },
		e: PointerEvent
	) {
		element.ondragstart = () => false
		element.style.position = 'fixed'
		element.style.width = initialGeometry.width + 'px'
		element.style.height = initialGeometry.height + 'px'
		element.dataset['dragging'] = 'true'
		element.dispatchEvent(
			new CustomEvent('dragstart', { bubbles: true, detail: { instance: config.componentInstance } })
		)

		const strategy = (DragStrategyFactory.instance as DragStrategyFactory).getStrategy(config.direction)
		const shift = {
			x: e.clientX - element.getBoundingClientRect().left,
			y: e.clientY - element.getBoundingClientRect().top
		}
		const start = {
			x: e.clientX,
			y: e.clientY
		}

		const moving = (e: PointerEvent) => {
			strategy.move(element, shift, start, config, e)

			const elementCoords = element.getBoundingClientRect()
			const elementDelta = {
				x: elementCoords.left - initialGeometry.left,
				y: elementCoords.top - initialGeometry.top,
				center: {
					x: elementCoords.left + elementCoords.width / 2 - initialGeometry.center.x,
					y: elementCoords.top + elementCoords.height / 2 - initialGeometry.center.y
				}
			}
			element.dispatchEvent(
				new CustomEvent('dragmove', {
					bubbles: true,
					detail: {
						instance: config.componentInstance,
						elementDelta
					}
				})
			)
		}

		const release = (e: PointerEvent) => {
			const delta = strategy.getDelta(e, start)
			const isThresholdPassed = strategy.checkThreshold(delta, config.threshold)

			let swipeDirection: DragCustomEvent['detail']['direction'] = {
				x: delta.x > 0 ? 'right' : 'left',
				y: delta.y > 0 ? 'down' : 'up'
			}

			if (config.snap) {
				strategy.snap(element, initialGeometry, isThresholdPassed, config.snap)
			}

			// console.log(swipeDirection, delta)

			element.dataset['dragging'] = 'false'
			element.ondragstart = null
			element.removeEventListener('pointermove', moving)
			element.removeEventListener('pointerup', release)

			element.dispatchEvent(
				new CustomEvent('dragend', {
					bubbles: true,
					detail: {
						instance: config.componentInstance,
						isInView: strategy.isInView(element),
						direction: swipeDirection,
						thresholdPassed: config.threshold ? isThresholdPassed : null
					}
				})
			)
		}

		element.addEventListener('pointermove', moving, { passive: true })
		element.addEventListener('pointerup', release, { passive: true })
		element.setPointerCapture(e.pointerId)
	}
}

interface Strategies {
	horizontal: DragHorizontalStrategy
	vertical: DragVerticalStrategy
	both: DragBothStrategy
}

type StrategyClasses = {
	[K in keyof Strategies]: { instance: Strategies[K] }
}

abstract class DragStrategyFactory extends Singleton {
	#strategies: StrategyClasses = {
		horizontal: DragHorizontalStrategy,
		vertical: DragVerticalStrategy,
		both: DragBothStrategy
	}

	getStrategy<T extends DragConfig['direction']>(direction: T): Strategies[T] {
		// Lazy: стратегии инициализируются по требованию, а не при создании фабрики
		return this.#strategies[direction].instance
	}
}

type StrategyInfo = AtLeastOneInObject<{
	x: {
		cssProperty: 'left'
		oppositeCssProperty: 'right'
		directionPositive: 'right'
		directionNegative: 'left'
		offsetSize: 'offsetWidth'
	}
	y: {
		cssProperty: 'top'
		oppositeCssProperty: 'bottom'
		directionPositive: 'top'
		directionNegative: 'bottom'
		offsetSize: 'offsetHeight'
	}
}>

abstract class DragCore extends Singleton {
	abstract info: StrategyInfo

	checkThreshold(delta: ReturnType<typeof this.getDelta>, threshold: number) {
		const result = {} as AtLeastOneInObject<{ x: boolean; y: boolean }>
		for (const axis of Object.keys(this.info) as Array<keyof typeof this.info>) {
			result[axis] = Math.abs(delta[axis]) > threshold
		}
		console.log(this.constructor.name, 'checkThreshold', result)
		return result
	}

	getDireciton(delta: ReturnType<typeof this.getDelta>) {
		const result = {} as AtLeastOneInObject<{
			x: StrategyInfo['x'][] | StrategyInfo['directionPositive']
			y: 'up' | 'down'
		}>
		for (const [axis, meta] of Object.entries(this.info)) {
			result[axis] = delta[axis] > 0 ? meta['cssProperty'] : meta['oppositeCssProperty']
		}
	}

	checkBounds(element: HTMLElement, rect: DOMRect, boundsSides: AtLeastOneInObject<{ top: number; left: number }>) {
		const result: AtLeastOneInObject<{ left: boolean; right: boolean }> &
			AtLeastOneInObject<{ top: boolean; bottom: boolean }> = {}

		for (const meta of Object.values(this.info)) {
			const p = meta.cssProperty
			const op = meta.oppositeCssProperty
			const max = rect[op] - element[meta.offsetSize]

			result[p] = boundsSides[p] <= rect[p]
			result[op] = boundsSides[p] >= max
			// возможно проблема дальше в типах конфига
		}
		console.log(this.constructor.name, 'checkBounds', result)
		return result
	}

	isInView(element: HTMLElement) {
		const elementCoords = element.getBoundingClientRect()
		return {
			topLeft: !!document.elementFromPoint(elementCoords.left, elementCoords.top),
			topRight: !!document.elementFromPoint(elementCoords.right, elementCoords.top),
			bottomLeft: !!document.elementFromPoint(elementCoords.left, elementCoords.bottom),
			bottomRight: !!document.elementFromPoint(elementCoords.right, elementCoords.bottom)
		}
	} // общая, исходя из использования

	#applyResistance(delta: number, threshold: number, resistance: number) {
		const T = Math.max(0, threshold)
		const R = Math.max(0, resistance)
		const a = Math.abs(delta)
		const s = Math.sign(delta) || 1

		return a <= T ? delta : s * (T + (a - T) / (1 + R))
	}

	snap(
		element: HTMLElement,
		initialGeomerty: InitialGeomerty,
		isThresholdPassed: ReturnType<typeof this.checkThreshold>,
		snap
	) {
		isThresholdPassed = Object.keys(isThresholdPassed).every(axis => isThresholdPassed[axis])
		const shouldSnap = !isThresholdPassed || (isThresholdPassed && !snap.forwards)
		if (!shouldSnap) return

		const clearStyles = () => {
			element.ontransitionend = null
			element.style.width = null
			element.style.height = null
			for (const meta of Object.values(this.info)) {
				element.style[meta.cssProperty] = null
			}
			element.style.position = null
		}

		if (!snap.animation) {
			clearStyles()
			return
		}

		const promises = []
		for (const meta of Object.values(this.info)) {
			element.style[meta.cssProperty] = initialGeomerty[meta.cssProperty] + 'px'

			promises.push(
				new Promise(resolve => {
					element.ontransitionend = e => {
						if (e.propertyName !== meta.cssProperty) return
						resolve(null)
					}
				})
			)
		}
		Promise.all(promises).then(clearStyles)
	}

	move(
		element: HTMLElement,
		shift: { x: number; y: number },
		start: { x: number; y: number },
		{ resistance, threshold, bounds }: DragConfig,
		e: PointerEvent
	) {
		const delta = this.getDelta(e, start)

		const stylePropertySides = {} as AtLeastOneInObject<{ top: number; left: number }>

		for (const [axis, meta] of Object.entries(this.info)) {
			const appliedDelta = this.#applyResistance(delta[axis], threshold, resistance)

			stylePropertySides[meta.cssProperty] = start[axis] - shift[axis] + appliedDelta
		}

		if (bounds) {
			const bounded = this.checkBounds(element, bounds.rect, stylePropertySides)
			for (const side of bounds.sides) {
				if (bounded[side]) return
			}
		}

		for (const meta of Object.values(this.info)) {
			element.style[meta.cssProperty] = stylePropertySides[meta.cssProperty] + 'px'
		}
	}

	getDelta({ clientX, clientY }: PointerEvent, start: { x: number; y: number }) {
		return { x: clientX - start.x, y: clientY - start.y }
	}
}

class DragHorizontalStrategy extends DragCore {
	info = {
		x: {
			cssProperty: 'left',
			oppositeCssProperty: 'right',
			directionPositive: 'right',
			directionNegative: 'left',
			offsetSize: 'offsetWidth'
		}
	} as const
}

class DragVerticalStrategy extends DragCore {
	info = {
		y: {
			cssProperty: 'top',
			oppositeCssProperty: 'bottom',
			directionPositive: 'top',
			directionNegative: 'bottom',
			offsetSize: 'offsetHeight'
		}
	} as const
}

class DragBothStrategy extends DragCore {
	info = {
		x: {
			cssProperty: 'left',
			oppositeCssProperty: 'right',
			directionPositive: 'right',
			directionNegative: 'left',
			offsetSize: 'offsetWidth'
		},
		y: {
			cssProperty: 'top',
			oppositeCssProperty: 'bottom',
			directionPositive: 'top',
			directionNegative: 'bottom',
			offsetSize: 'offsetHeight'
		}
	} as const
}
