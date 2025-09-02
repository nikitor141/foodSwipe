import { Favorites } from '@/components/screens/favorites/favorites.component'
import { Home } from '@/components/screens/home/home.component'
import { FAVORITES_URL, HOME_URL } from '@/constants/routes.constants'
import { BaseScreenConstructor } from '../component/base-screen.component'

export const ROUTES: Record<string, BaseScreenConstructor> = {
	[HOME_URL]: Home,
	[FAVORITES_URL]: Favorites
}
