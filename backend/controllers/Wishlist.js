const Wishlist = require('../models/Wishlist')
const Product = require('../models/Product')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const populated = (query) => query.populate({ path: 'product', populate: { path: 'brand' } })

exports.list = asyncHandler(async (req, res) => {
  const items = await populated(Wishlist.find({ user: req.user._id }).sort('-createdAt'))
  res.json(items.filter((item) => item.product && !item.product.isDeleted))
})

exports.add = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.body.product, isDeleted: false })
  if (!product) throw new AppError(404, 'Product not found')

  const item = await populated(
    Wishlist.findOneAndUpdate(
      { user: req.user._id, product: product._id },
      { $setOnInsert: { user: req.user._id, product: product._id } },
      { upsert: true, new: true }
    )
  )

  res.status(201).json(item)
})

exports.update = asyncHandler(async (req, res) => {
  const item = await populated(
    Wishlist.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { note: req.body.note }, { new: true })
  )

  if (!item) throw new AppError(404, 'Wishlist item not found')
  res.json(item)
})

exports.remove = asyncHandler(async (req, res) => {
  const deleted = await Wishlist.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  if (!deleted) throw new AppError(404, 'Wishlist item not found')

  res.json(deleted)
})
