const mongoose = require('mongoose')

const { ObjectId } = mongoose.Schema.Types

const reviewSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: 'User', required: true },
    product: { type: ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: [1000, 'Reviews can be at most 1000 characters'] },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

reviewSchema.index({ user: 1, product: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)
