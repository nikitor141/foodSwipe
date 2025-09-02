import { Singleton } from '@/utils/singleton'

type NormalizedImage = {
	original: string
	webp: string
	avif: string
	w: number
	h: number
}

export class ImagesStore extends Singleton {
	protected constructor() {
		super()
	}

	#rawImages = import.meta.glob('/src/assets/img/**/*.{jpg,png,webp,avif}', {
		eager: true,
		query: {
			format: 'avif;webp;png;jpg',
			quality: '80',
			as: 'picture'
		}
	}) as Record<
		string,
		{ default: string[]; img: { src: string; h: number; w: number }; sources: Record<string, string> }
	>
	images: Record<string, NormalizedImage> = Object.fromEntries(
		Object.entries(this.#rawImages).map(([path, data]) => {
			const normalized: NormalizedImage = {
				w: data.img.w,
				h: data.img.h,
				original: path.endsWith('.jpg') || path.endsWith('.jpeg') ? data.img.src : data.sources.png.split(' ')[0],
				avif: data.sources.avif,
				webp: data.sources.webp
			}
			return [path, normalized]
		})
	)
}
