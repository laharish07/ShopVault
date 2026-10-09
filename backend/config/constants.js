module.exports = {
  APP_NAME: 'ShopVault',
  SHIPPING_FEE: 5.55,
  FLAT_TAX: 5,
  MAX_CART_QUANTITY: 10,
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  OTP_MAX_ATTEMPTS: 5,
  OTP_RESEND_COOLDOWN_MS: 30 * 1000,
  ORDER_STATUSES: ['Pending', 'Dispatched', 'Out for delivery', 'Delivered', 'Cancelled'],
  PAYMENT_MODES: ['COD', 'CARD'],
}
