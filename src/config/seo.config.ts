const SITE_NAME = 'Food Swipe'

export function getTitle(title: string) {
	return title ? `${title} | ${SITE_NAME}` : SITE_NAME
}
