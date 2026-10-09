const Product = require('../models/Product')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const withRelations = (query) => query.populate('brand').populate('category')

exports.list = asyncHandler(async (req, res) => {
  const { brand, category, q, sort, order, page, limit } = req.validatedQuery
  const filter = {}

  if (!req.user.isAdmin) filter.isDeleted = false
  if (brand?.length) filter.brand = { $in: brand }
  if (category?.length) filter.category = { $in: category }
  if (q) filter.title = { $regex: escapeRegex(q), $options: 'i' }

  const direction = order === 'asc' ? 1 : -1

  const [items, total] = await Promise.all([
    withRelations(Product.find(filter))
      .sort({ [sort]: direction, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ])

  res.json({ items, total, page, limit })
})

exports.getById = asyncHandler(async (req, res) => {
  const product = await withRelations(Product.findById(req.params.id))

  if (!product || (product.isDeleted && !req.user.isAdmin)) {
    throw new AppError(404, 'Product not found')
  }

  res.json(product)
})

exports.create = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json(await withRelations(Product.findById(product._id)))
})

exports.update = asyncHandler(async (req, res) => {
  const product = await withRelations(
    Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  )

  if (!product) throw new AppError(404, 'Product not found')
  res.json(product)
})

const setDeleted = (isDeleted) =>
  asyncHandler(async (req, res) => {
    const product = await withRelations(Product.findByIdAndUpdate(req.params.id, { isDeleted }, { new: true }))

    if (!product) throw new AppError(404, 'Product not found')
    res.json(product)
  })

exports.remove = setDeleted(true)
exports.restore = setDeleted(false)
