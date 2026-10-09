const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Address = require('../models/Address')
const Product = require('../models/Product')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { summarize } = require('../utils/pricing')

const restock = (order) =>
  Promise.all(
    order.item.map(({ product, quantity }) =>
      Product.updateOne({ _id: product._id }, { $inc: { stockQuantity: quantity } })
    )
  )

const toSnapshot = ({ product, quantity }) => ({
  product: {
    _id: product._id,
    title: product.title,
    thumbnail: product.thumbnail,
    price: product.price,
    discountPercentage: product.discountPercentage,
    brand: { _id: product.brand?._id, name: product.brand?.name },
  },
  quantity,
  unitPrice: product.finalPrice,
})

exports.create = asyncHandler(async (req, res) => {
  const { addressId, paymentMode } = req.body

  const address = await Address.findOne({ _id: addressId, user: req.user._id })
  if (!address) throw new AppError(400, 'Choose a delivery address')

  const rows = (await Cart.find({ user: req.user._id }).populate({ path: 'product', populate: { path: 'brand' } })).filter(
    (row) => row.product
  )
  if (!rows.length) throw new AppError(400, 'Your cart is empty')

  // Reserve stock line by line. Each update only succeeds if enough stock is left, so two
  // shoppers can never buy the last unit at the same time.
  const reserved = []
  let order

  try {
    for (const { product, quantity } of rows) {
      const updated = await Product.findOneAndUpdate(
        { _id: product._id, isDeleted: false, stockQuantity: { $gte: quantity } },
        { $inc: { stockQuantity: -quantity } }
      )

      if (!updated) {
        throw new AppError(409, `"${product.title}" is no longer available in the quantity you chose. Please review your cart.`)
      }
      reserved.push({ id: product._id, quantity })
    }

    const item = rows.map(toSnapshot)
    const totals = summarize(item)

    order = await Order.create({
      user: req.user._id,
      item,
      address: [address.toObject()],
      paymentMode,
      ...totals,
    })
  } catch (error) {
    await Promise.all(reserved.map(({ id, quantity }) => Product.updateOne({ _id: id }, { $inc: { stockQuantity: quantity } })))
    throw error
  }

  await Cart.deleteMany({ user: req.user._id })
  res.status(201).json(order)
})

exports.listMine = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort('-createdAt'))
})

exports.getById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (!order || (!req.user.isAdmin && !order.user.equals(req.user._id))) {
    throw new AppError(404, 'Order not found')
  }

  res.json(order)
})

exports.listAll = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedQuery

  const [items, total] = await Promise.all([
    Order.find()
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email'),
    Order.countDocuments(),
  ])

  res.json({ items, total, page, limit })
})

exports.updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new AppError(404, 'Order not found')

  const { status } = req.body

  if (order.status === 'Cancelled' && status !== 'Cancelled') {
    throw new AppError(400, 'A cancelled order cannot be reopened')
  }

  const becomingCancelled = status === 'Cancelled' && order.status !== 'Cancelled'
  order.status = status
  await order.save()
  if (becomingCancelled) await restock(order)

  res.json(await order.populate('user', 'name email'))
})

exports.cancel = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
  if (!order) throw new AppError(404, 'Order not found')

  if (order.status !== 'Pending') {
    throw new AppError(400, 'Only orders that have not been dispatched can be cancelled')
  }

  order.status = 'Cancelled'
  await order.save()
  await restock(order)

  res.json(order)
})
