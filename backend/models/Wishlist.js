const mongoose = require('mongoose')

const { ObjectId } = mongoose.Schema.Types

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: 'User', required: true },
    product: { type: ObjectId, ref: 'Product', required: true },
    note: { type: String, trim: true, maxlength: [300, 'Notes can be at most 300 characters'] },
  },
  { timestamps: true, versionKey: false }
)

wishlistSchema.index({ user: 1, product: 1 }, { unique: true })

module.exports = mongoose.model('Wishlist', wishlistSchema)
