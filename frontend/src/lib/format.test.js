import { discountOf, formatPrice, initialsOf, priceOf, shortOrderId } from './format'

test('formats prices as US dollars', () => {
  expect(formatPrice(1234.5)).toBe('$1,234.50')
  expect(formatPrice()).toBe('$0.00')
})

test('prefers the computed final price when present', () => {
  expect(priceOf({ price: 100, finalPrice: 90 })).toBe(90)
  expect(priceOf({ price: 100 })).toBe(100)
})

test('rounds the discount percentage', () => {
  expect(discountOf({ discountPercentage: 12.96 })).toBe(13)
  expect(discountOf({})).toBe(0)
})

test('builds short ids and initials', () => {
  expect(shortOrderId('65c2658db53f820728d0745a')).toBe('28D0745A')
  expect(initialsOf('demo user')).toBe('DU')
  expect(initialsOf('')).toBe('')
})
