const mongoose = require('mongoose')
const { unitPrice } = require('../utils/pricing')

const { ObjectId } = mongoose.Schema.Types

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: ObjectId, ref: 'Category', required: true },
    brand: { type: ObjectId, ref: 'Brand', required: true },
    stockQuantity: { type: Number, required: true, min: [0, 'Stock cannot be negative'] },
    thumbnail: { type: String, required: true, trim: true },
    images: {
      type: [String],
      validate: { validator: (images) => images.length > 0, message: 'At least one image is required' },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

productSchema.virtual('finalPrice').get(function () {
  return unitPrice(this)
})

productSchema.index({ isDeleted: 1, createdAt: -1 })

module.exports = mongoose.model('Product', productSchema)
