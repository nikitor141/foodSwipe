import '@/styles/global.scss'
import { ProductsService } from './api/products.service'

const yesButton = document.querySelector('.buttons__yes')
const noButton = document.querySelector('.buttons__no')
const wrapper = document.querySelector('.wrapper')
const card = document.createElement('a')

yesButton.onclick = async () => {
	card.innerHTML = ''

	let result = await new ProductsService().getRandomProducts(1, { categories: [], subcategories: [], products: [] })
	console.log(result)
	result = result[0]

	const image = document.createElement('img')
	image.src = result.image
	image.crossorigin = 'anonymous'

	const name = document.createElement('h2')
	name.textContent = result.name

	const price = document.createElement('p')
	price.className = 'price'
	price.textContent = result.price + 'р'

	const categoryName = document.createElement('p')
	categoryName.className = 'category'
	categoryName.textContent = result.categoryName

	const subcategoryName = document.createElement('p')
	subcategoryName.className = 'subcategory'
	subcategoryName.textContent = result.subcategoryName

	card.href = result.url
	card.target = '_blank'
	card.append(image, price, name, categoryName, subcategoryName)
	wrapper.append(card)
}
noButton.onclick = async () => {
	try {
		let product = await new ProductsService().getProductById(1220444)
		console.log(product)
	} catch (err) {
		console.error(err)
	}
}
