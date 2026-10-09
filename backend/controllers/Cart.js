const Cart = require('../models/Cart')
const Product = require('../models/Product')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { summarize } = require('../utils/pricing')
const { MAX_CART_QUANTITY } = require('../config/constants')

const isAvailable = (product) => product && !product.isDeleted && product.stockQuantity > 0

// Builds the cart payload the client renders: items plus server-computed totals.
const buildCart = async (userId) => {
  const rows = await Cart.find({ user: userId }).populate({ path: 'product', populate: { path: 'brand' } })
  const items = rows.filter((row) => row.product)

  const lines = items
    .filter((row) => isAvailable(row.product))
    .map((row) => ({ unitPrice: row.product.finalPrice, quantity: Math.min(row.quantity, row.product.stockQuantity) }))

  return { items, summary: summarize(lines) }
}

const maxQuantityFor = (product) => Math.min(MAX_CART_QUANTITY, product.stockQuantity)

exports.get = asyncHandler(async (req, res) => {
  res.json(await buildCart(req.user._id))
})

exports.add = asyncHandler(async (req, res) => {
  const { product: productId, quantity } = req.body
  const product = await Product.findById(productId)

  if (!isAvailable(product)) throw new AppError(404, 'This product is not available right now')

  const existing = await Cart.findOne({ user: req.user._id, product: productId })
  const nextQuantity = Math.min((existing?.quantity || 0) + quantity, maxQuantityFor(product))

  await Cart.findOneAndUpdate(
    { user: req.user._id, product: productId },
    { quantity: nextQuantity },
    { upsert: true, setDefaultsOnInsert: true }
  )

  res.status(201).json(await buildCart(req.user._id))
})

exports.update = asyncHandler(async (req, res) => {
  const item = await Cart.findOne({ _id: req.params.id, user: req.user._id }).populate('product')
  if (!item || !item.product) throw new AppError(404, 'Cart item not found')

  const limit = maxQuantityFor(item.product)
  if (req.body.quantity > limit) {
    throw new AppError(400, `Only ${limit} available for this product`)
  }

  item.quantity = req.body.quantity
  await item.save()

  res.json(await buildCart(req.user._id))
})

exports.remove = asyncHandler(async (req, res) => {
  const deleted = await Cart.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  if (!deleted) throw new AppError(404, 'Cart item not found')

  res.json(await buildCart(req.user._id))
})

exports.clear = asyncHandler(async (req, res) => {
  await Cart.deleteMany({ user: req.user._id })
  res.json(await buildCart(req.user._id))
})

exports.buildCart = buildCart
exports.isAvailable = isAvailable
