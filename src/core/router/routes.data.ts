import { WishList } from '@components/screens/wish-list/wish-list.component.ts'
import { ScreenSingleton } from '@core/component/base-screen.types.ts'
import { Home } from '@/components/screens/home/home.component'
import { HOME_URL, WISH_LIST_URL } from '@/constants/routes.constants'

export const ROUTES: Record<string, ScreenSingleton> = {
	[HOME_URL]: Home,
	[WISH_LIST_URL]: WishList
}
