import autoprefixer from 'autoprefixer'
import path from 'path'
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'
import webfontDownload from 'vite-plugin-webfont-dl'

export default defineConfig(() => {
	return {
		resolve: {
			alias: {
				'@': path.resolve('/src'),
				'@components': path.resolve('src/components'),
				'@utils': path.resolve('src/utils'),
				'@core': path.resolve('src/core')
			}
		},
		plugins: [imagetools(), webfontDownload()],
		css: {
			postcss: {
				plugins: [autoprefixer()]
			}
		}
	}
})
