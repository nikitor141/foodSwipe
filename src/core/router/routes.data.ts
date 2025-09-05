import { Favorites } from '@/components/screens/favorites/favorites.component'
import { Home } from '@/components/screens/home/home.component'
import { FAVORITES_URL, HOME_URL } from '@/constants/routes.constants'
import { ScreenSingleton } from '../component/base-screen.types'

export const ROUTES: Record<string, ScreenSingleton> = {
	[HOME_URL]: Home,
	[FAVORITES_URL]: Favorites
}
