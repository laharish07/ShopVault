const { z } = require('zod')
const { ORDER_STATUSES, PAYMENT_MODES, MAX_CART_QUANTITY, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } = require('../config/constants')

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

const name = z.string().trim().min(2, 'Name must be at least 2 characters').max(60)
const email = z.string().trim().toLowerCase().email('Enter a valid email address')
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password needs a lowercase letter')
  .regex(/[A-Z]/, 'Password needs an uppercase letter')
  .regex(/\d/, 'Password needs a number')

const asArray = (schema) =>
  z.preprocess((value) => (value === undefined ? undefined : Array.isArray(value) ? value : [value]), z.array(schema).optional())

const money = z.coerce.number({ message: 'Enter a valid number' })

const productFields = {
  title: z.string().trim().min(2, 'Title is required').max(150),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  price: money.min(0, 'Price cannot be negative'),
  discountPercentage: money.min(0).max(100, 'Discount must be between 0 and 100').default(0),
  stockQuantity: money.int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  brand: objectId,
  category: objectId,
  thumbnail: z.string().trim().url('Thumbnail must be a valid URL'),
  images: z.array(z.string().trim().url('Every image must be a valid URL')).min(1, 'Add at least one image').max(10),
}

exports.signup = z.object({ name, email, password })
exports.login = z.object({ email, password: z.string().min(1, 'Password is required') })
exports.verifyOtp = z.object({ otp: z.string().trim().regex(/^\d{6}$/, 'Enter the 6 digit code') })
exports.forgotPassword = z.object({ email })
exports.resetPassword = z.object({ token: z.string().min(10, 'Invalid reset link'), password })

exports.productCreate = z.object(productFields)
exports.productUpdate = z.object(productFields).partial()

exports.productQuery = z.object({
  brand: asArray(objectId),
  category: asArray(objectId),
  q: z.string().trim().max(80).optional(),
  sort: z.enum(['price', 'title', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
})

exports.cartAdd = z.object({
  product: objectId,
  quantity: z.coerce.number().int().min(1).max(MAX_CART_QUANTITY).default(1),
})
exports.cartUpdate = z.object({ quantity: z.coerce.number().int().min(1).max(MAX_CART_QUANTITY) })

exports.wishlistAdd = z.object({ product: objectId })
exports.wishlistUpdate = z.object({ note: z.string().trim().max(300, 'Notes can be at most 300 characters') })

exports.address = z.object({
  type: z.string().trim().min(1, 'Give the address a label, e.g. Home').max(30),
  street: z.string().trim().min(3, 'Street is required').max(120),
  city: z.string().trim().min(1, 'City is required').max(60),
  state: z.string().trim().min(1, 'State is required').max(60),
  postalCode: z.string().trim().regex(/^[A-Za-z0-9 -]{3,10}$/, 'Enter a valid postal code'),
  country: z.string().trim().min(2, 'Country is required').max(60),
  phoneNumber: z.string().trim().regex(/^\+?\d{7,15}$/, 'Enter a valid phone number'),
})
exports.addressUpdate = exports.address.partial()

exports.orderCreate = z.object({ addressId: objectId, paymentMode: z.enum(PAYMENT_MODES) })
exports.orderStatus = z.object({ status: z.enum(ORDER_STATUSES) })
exports.orderQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
})

exports.reviewCreate = z.object({
  product: objectId,
  rating: z.coerce.number().int().min(1, 'Choose a rating').max(5),
  comment: z.string().trim().min(3, 'Write a few words about the product').max(1000),
})
exports.reviewUpdate = exports.reviewCreate.omit({ product: true }).partial()
exports.objectId = objectId
