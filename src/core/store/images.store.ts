import { Singleton } from '@/utils/singleton'
import { Entries } from '@/utils/types'

type NormalizedImage = {
	original: string
	webp: string
	avif: string
	w: number
	h: number
}
type RawImages = Record<
	string,
	{
		default: string[]
		img: { src: string; h: number; w: number }
		sources: { avif: string; webp: string; png: string }
	}
>

export class ImagesStore extends Singleton {
	#rawImages = import.meta.glob('/src/assets/img/**/*.{jpg,png,webp,avif}', {
		eager: true,
		query: {
			format: 'avif;webp;png;jpg',
			quality: '80',
			as: 'picture'
		}
	}) as RawImages

	images: { [K in keyof RawImages]: NormalizedImage } = Object.fromEntries(
		(Object.entries(this.#rawImages) as Entries<RawImages>).map(([path, data]) => {
			const normalized: NormalizedImage = {
				w: data.img.w,
				h: data.img.h,
				original: path.endsWith('.jpg') || path.endsWith('.jpeg') ? data.img.src : data.sources['png'].split(' ')[0]!,
				avif: data.sources['avif'],
				webp: data.sources['webp']
			}
			return [path, normalized]
		})
	)

	protected constructor() {
		super()
	}
}
