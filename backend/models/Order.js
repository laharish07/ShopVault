const mongoose = require('mongoose')
const { ORDER_STATUSES, PAYMENT_MODES } = require('../config/constants')

const { Mixed, ObjectId } = mongoose.Schema.Types

// `item` and `address` hold snapshots taken at checkout, so later edits to a product
// or a saved address never change what an existing order shows.
const orderSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: 'User', required: true, index: true },
    item: { type: [Mixed], required: true },
    address: { type: [Mixed], required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending' },
    paymentMode: { type: String, enum: PAYMENT_MODES, required: true },
    subtotal: Number,
    shipping: Number,
    tax: Number,
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

module.exports = mongoose.model('Order', orderSchema)
