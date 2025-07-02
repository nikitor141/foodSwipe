import { Singleton } from '@/utils/singleton'

export class ImagesStore extends Singleton {
	images = import.meta.glob('/src/assets/img/**/*.{jpg,png,webp,avif}', {
		eager: true,
		query: {
			format: 'avif;webp',
			quality: '80'
		}
	})
}
