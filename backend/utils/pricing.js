const { SHIPPING_FEE, FLAT_TAX } = require('../config/constants')

const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100

const unitPrice = (product) => round(product.price * (1 - (product.discountPercentage || 0) / 100))

const summarize = (lines) => {
  const subtotal = round(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0))
  const shipping = lines.length ? SHIPPING_FEE : 0
  const tax = lines.length ? FLAT_TAX : 0

  return { subtotal, shipping, tax, total: round(subtotal + shipping + tax) }
}

module.exports = { round, unitPrice, summarize }
