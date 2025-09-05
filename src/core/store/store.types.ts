import { ScreenSingleton } from '@core/component/base-screen.types.ts'
import { AvailableThemes } from '@core/services/themes.service.ts'

export interface StateItems {
	theme: AvailableThemes
	screen: { previous: ScreenSingleton; current: ScreenSingleton }
}
