import { ImagesStore } from '@/core/store/images.store'

export function imgToPicture(tag: HTMLImageElement) {
	const imageStore: ImagesStore = ImagesStore.instance
	const src = tag.dataset['src']
	if (!src) throw new Error('Attribute src doesn`t specified')
	const image = imageStore.images[src]
	if (!image) throw new Error('Image not found')
	const { original, avif, webp, w, h } = imageStore.images[tag.dataset['src']!]!

	const template = document.createElement('template')
	template.innerHTML = `
	   <picture>
				<source srcset="${avif}" type="image/avif"></source>
				<source srcset="${webp}" type="image/webp"></source>
				<img src="${original}" width="${w}" height="${h}" loading="lazy" alt="${tag.alt || original.split('/').at(-1)}">
		</picture>
	`.trim()

	return template.content.firstElementChild as HTMLPictureElement
}
