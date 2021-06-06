import asyncHandler from 'express-async-handler'
import Product from '../models/productModel.js'

// @desc   GET all products
// @route  /api/products
// @access Public
export const getProducts = asyncHandler(async (req, res) => {
	const products = await Product.find()

	res.json(products)
})

// @desc   GET single product
// @route  /api/products/:id
// @access Public
export const getProductDetails = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id)

	if (product) {
		res.json(product)
	} else {
		res.status(404)
		throw new Error('Product not found')
	}
})

//* Admin routes

// @desc   Delete single product
// @route  /api/products/:id
// @access Private Admin
export const deleteProduct = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id)

	if (product) {
		await product.remove()
		res.json({ message: 'Product Removed' })
	} else {
		res.status(404)
		throw new Error('Product not found')
	}
})
