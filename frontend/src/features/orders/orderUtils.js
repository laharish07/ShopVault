// Orders are snapshots, and older records were stored with a slightly different shape
// (no thumbnail / unitPrice). These helpers read both.
export const lineOf = (item) => {
  const { product, quantity } = item
  const discount = product.discountPercentage || 0

  return {
    id: product._id,
    title: product.title,
    brand: product.brand?.name,
    image: product.thumbnail || product.images?.[0],
    quantity,
    unitPrice: item.unitPrice ?? Math.round(product.price * (1 - discount / 100) * 100) / 100,
  }
}

export const STATUS_COLORS = {
  Pending: 'warning',
  Dispatched: 'info',
  'Out for delivery': 'info',
  Delivered: 'success',
  Cancelled: 'default',
}

export const paymentLabel = (mode) => (mode === 'CARD' ? 'Card on delivery' : 'Cash on delivery')
