const mongoose = require('mongoose')
const { MAX_CART_QUANTITY } = require('../config/constants')

const { ObjectId } = mongoose.Schema.Types

const cartSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: 'User', required: true },
    product: { type: ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1, max: MAX_CART_QUANTITY },
  },
  { versionKey: false }
)

cartSchema.index({ user: 1, product: 1 }, { unique: true })

module.exports = mongoose.model('Cart', cartSchema)
