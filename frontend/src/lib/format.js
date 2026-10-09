const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const formatPrice = (value = 0) => currency.format(value)

export const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

export const shortOrderId = (id = '') => id.slice(-8).toUpperCase()

// Products from the API carry a computed finalPrice; order snapshots may not.
export const priceOf = (product) => product.finalPrice ?? product.price

export const discountOf = (product) => Math.round(product.discountPercentage || 0)

export const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
