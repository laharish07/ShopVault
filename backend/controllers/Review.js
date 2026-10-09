const mongoose = require('mongoose')
const Review = require('../models/Review')
const Product = require('../models/Product')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { objectId } = require('../validators')

const MAX_REVIEWS_RETURNED = 50

const withAuthor = (query) => query.populate('user', 'name')

const summarize = (distribution) => {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  distribution.forEach(({ _id, count }) => {
    counts[_id] = count
  })

  const count = Object.values(counts).reduce((sum, value) => sum + value, 0)
  const total = Object.entries(counts).reduce((sum, [rating, value]) => sum + Number(rating) * value, 0)

  return { count, average: count ? Math.round((total / count) * 10) / 10 : 0, counts }
}

exports.listForProduct = asyncHandler(async (req, res) => {
  const productId = objectId.parse(req.params.id)

  const [items, distribution] = await Promise.all([
    withAuthor(Review.find({ product: productId }).sort('-createdAt').limit(MAX_REVIEWS_RETURNED)),
    Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),
  ])

  res.json({ items: items.filter((review) => review.user), summary: summarize(distribution) })
})

exports.create = asyncHandler(async (req, res) => {
  const { product, rating, comment } = req.body

  if (!(await Product.exists({ _id: product, isDeleted: false }))) throw new AppError(404, 'Product not found')
  if (await Review.exists({ user: req.user._id, product })) {
    throw new AppError(409, 'You have already reviewed this product')
  }

  const review = await Review.create({ user: req.user._id, product, rating, comment })
  res.status(201).json(await withAuthor(Review.findById(review._id)))
})

exports.update = asyncHandler(async (req, res) => {
  const review = await withAuthor(
    Review.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true })
  )

  if (!review) throw new AppError(404, 'Review not found')
  res.json(review)
})

exports.remove = asyncHandler(async (req, res) => {
  const filter = req.user.isAdmin ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id }
  const review = await Review.findOneAndDelete(filter)

  if (!review) throw new AppError(404, 'Review not found')
  res.json({ _id: review._id })
})
