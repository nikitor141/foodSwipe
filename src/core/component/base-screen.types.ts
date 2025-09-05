import { BaseScreen } from '@core/component/base-screen.component.ts'

export type ScreenSingleton<T extends BaseScreen = BaseScreen> = {
	readonly instance: T
}
