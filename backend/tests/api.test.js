process.env.NODE_ENV = 'test'
process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/shopvault-test'
process.env.SECRET_KEY = 'test-secret'
process.env.ORIGIN = 'http://localhost:3000'

const { test, before, after, describe } = require('node:test')
const assert = require('node:assert/strict')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const request = require('supertest')

const app = require('../app')
const { connectToDB } = require('../database/db')
const { outbox } = require('../utils/mailer')
const User = require('../models/User')
const Brand = require('../models/Brand')
const Category = require('../models/Category')
const Product = require('../models/Product')

const PASSWORD = 'Sup3rSecret'
let brand
let category

const lastMailTo = (email) => [...outbox].reverse().find((mail) => mail.to === email)

const createProduct = (overrides = {}) =>
  Product.create({
    title: 'Test phone',
    description: 'A phone used in tests',
    price: 100,
    discountPercentage: 10,
    stockQuantity: 5,
    brand: brand._id,
    category: category._id,
    thumbnail: 'https://example.com/thumb.jpg',
    images: ['https://example.com/1.jpg'],
    ...overrides,
  })

// Signs a shopper up and completes email verification, returning a logged-in agent.
const signedInShopper = async (name = 'Test Shopper') => {
  const email = `${name.replace(/\s/g, '').toLowerCase()}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}@example.com`
  const agent = request.agent(app)

  await agent.post('/auth/signup').send({ name, email, password: PASSWORD }).expect(201)
  const otp = lastMailTo(email).text.match(/code is (\d{6})/)[1]
  await agent.post('/auth/verify-otp').send({ otp }).expect(200)

  return { agent, email }
}

const signedInAdmin = async () => {
  const email = `admin-${Date.now()}@example.com`
  await User.create({ name: 'Admin', email, password: await bcrypt.hash(PASSWORD, 4), isVerified: true, isAdmin: true })

  const agent = request.agent(app)
  await agent.post('/auth/login').send({ email, password: PASSWORD }).expect(200)
  return agent
}

const newAddress = { type: 'Home', street: '12 Market Road', city: 'Pune', state: 'MH', postalCode: '411001', country: 'India', phoneNumber: '9876543210' }

before(async () => {
  await connectToDB()
  await mongoose.connection.dropDatabase()
  brand = await Brand.create({ name: 'Acme' })
  category = await Category.create({ name: 'phones' })
})

after(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

describe('authentication', () => {
  test('rejects weak passwords and malformed emails', async () => {
    const weak = await request(app).post('/auth/signup').send({ name: 'Al', email: 'al@example.com', password: 'short' })
    assert.equal(weak.status, 400)

    const badEmail = await request(app).post('/auth/signup').send({ name: 'Alex', email: 'nope', password: PASSWORD })
    assert.equal(badEmail.status, 400)
  })

  test('signup cannot grant admin rights and never returns the password', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Sneaky', email: 'sneaky@example.com', password: PASSWORD, isAdmin: true, isVerified: true })

    assert.equal(res.status, 201)
    assert.equal(res.body.isAdmin, false)
    assert.equal(res.body.isVerified, false)
    assert.equal(res.body.password, undefined)
  })

  test('unverified users are blocked from the shop until they confirm their email', async () => {
    const agent = request.agent(app)
    const email = 'unverified@example.com'
    await agent.post('/auth/signup').send({ name: 'Una Verified', email, password: PASSWORD }).expect(201)

    await agent.get('/products').expect(403)
    await agent.post('/auth/verify-otp').send({ otp: '000000' }).expect(400)

    const otp = lastMailTo(email).text.match(/code is (\d{6})/)[1]
    const verified = await agent.post('/auth/verify-otp').send({ otp }).expect(200)
    assert.equal(verified.body.isVerified, true)

    await agent.get('/products').expect(200)
  })

  test('duplicate emails are rejected regardless of case', async () => {
    await request(app).post('/auth/signup').send({ name: 'Dup One', email: 'dup@example.com', password: PASSWORD }).expect(201)
    await request(app).post('/auth/signup').send({ name: 'Dup Two', email: 'DUP@example.com', password: PASSWORD }).expect(409)
  })

  test('login, session check and logout', async () => {
    const { agent, email } = await signedInShopper('Login Person')

    await agent.post('/auth/logout').expect(200)
    await agent.get('/auth/check-auth').expect(401)

    await request(app).post('/auth/login').send({ email, password: 'Wrong1234' }).expect(401)
    await agent.post('/auth/login').send({ email, password: PASSWORD }).expect(200)

    const me = await agent.get('/auth/check-auth').expect(200)
    assert.equal(me.body.email, email)
  })

  test('password reset uses a single-use token and gives no hint about unknown emails', async () => {
    const { email } = await signedInShopper('Reset Person')

    const unknown = await request(app).post('/auth/forgot-password').send({ email: 'ghost@example.com' })
    assert.equal(unknown.status, 200)
    assert.equal(lastMailTo('ghost@example.com'), undefined)

    await request(app).post('/auth/forgot-password').send({ email }).expect(200)
    const token = lastMailTo(email).text.match(/reset-password\/([a-f0-9]+)/)[1]

    await request(app).post('/auth/reset-password').send({ token: 'a'.repeat(64), password: 'NewPassw0rd' }).expect(400)
    await request(app).post('/auth/reset-password').send({ token, password: 'NewPassw0rd' }).expect(200)
    await request(app).post('/auth/reset-password').send({ token, password: 'AnotherPassw0rd' }).expect(400)

    await request(app).post('/auth/login').send({ email, password: PASSWORD }).expect(401)
    await request(app).post('/auth/login').send({ email, password: 'NewPassw0rd' }).expect(200)
  })
})

describe('access control', () => {
  test('anonymous requests are rejected', async () => {
    for (const path of ['/products', '/cart', '/wishlist', '/address', '/orders/mine']) {
      await request(app).get(path).expect(401)
    }
  })

  test('only admins can manage products and see every order', async () => {
    const { agent } = await signedInShopper('Regular Joe')
    const payload = {
      title: 'New gadget',
      description: 'Long enough description',
      price: 50,
      stockQuantity: 3,
      brand: String(brand._id),
      category: String(category._id),
      thumbnail: 'https://example.com/t.jpg',
      images: ['https://example.com/i.jpg'],
    }

    await agent.post('/products').send(payload).expect(403)
    await agent.get('/orders').expect(403)

    const admin = await signedInAdmin()
    const created = await admin.post('/products').send(payload).expect(201)
    assert.equal(created.body.brand.name, 'Acme')

    await admin.post('/products').send({ ...payload, price: -5 }).expect(400)
  })
})

describe('catalog', () => {
  test('supports search, sorting, pagination and hides deleted products from shoppers', async () => {
    await Product.deleteMany({})
    await createProduct({ title: 'Alpha lamp', price: 30 })
    await createProduct({ title: 'Beta lamp', price: 10 })
    const hidden = await createProduct({ title: 'Gamma lamp', price: 20, isDeleted: true })

    const { agent } = await signedInShopper('Browser')

    const cheapestFirst = await agent.get('/products?sort=price&order=asc&q=lamp').expect(200)
    assert.deepEqual(cheapestFirst.body.items.map((p) => p.title), ['Beta lamp', 'Alpha lamp'])
    assert.equal(cheapestFirst.body.total, 2)
    assert.equal(cheapestFirst.body.items[0].finalPrice, 9)

    const paged = await agent.get('/products?limit=1&page=2&sort=price&order=asc').expect(200)
    assert.equal(paged.body.items.length, 1)
    assert.equal(paged.body.items[0].title, 'Alpha lamp')

    await agent.get(`/products/${hidden._id}`).expect(404)
    const admin = await signedInAdmin()
    await admin.get(`/products/${hidden._id}`).expect(200)

    await agent.get('/products?brand=not-an-id').expect(400)
  })
})

describe('cart and checkout', () => {
  test('full purchase flow keeps stock, totals and ownership consistent', async () => {
    const product = await createProduct({ price: 100, discountPercentage: 10, stockQuantity: 5 })
    const { agent } = await signedInShopper('Buyer One')

    const added = await agent.post('/cart').send({ product: String(product._id), quantity: 2 }).expect(201)
    assert.equal(added.body.items.length, 1)
    assert.equal(added.body.summary.subtotal, 180)
    assert.equal(added.body.summary.total, 180 + 5.55 + 5)

    // adding again merges into one line and never exceeds the stock
    const more = await agent.post('/cart').send({ product: String(product._id), quantity: 10 }).expect(201)
    assert.equal(more.body.items.length, 1)
    assert.equal(more.body.items[0].quantity, 5)

    const lineId = more.body.items[0]._id
    await agent.patch(`/cart/${lineId}`).send({ quantity: 9 }).expect(400)
    const trimmed = await agent.patch(`/cart/${lineId}`).send({ quantity: 3 }).expect(200)
    assert.equal(trimmed.body.summary.subtotal, 270)

    // another shopper cannot touch this cart line
    const { agent: stranger } = await signedInShopper('Stranger')
    await stranger.delete(`/cart/${lineId}`).expect(404)

    await agent.post('/orders').send({ addressId: '65b8e564ea5ce114184ccb96', paymentMode: 'COD' }).expect(400)
    const address = await agent.post('/address').send(newAddress).expect(201)
    await stranger.post('/orders').send({ addressId: address.body._id, paymentMode: 'COD' }).expect(400)

    const order = await agent.post('/orders').send({ addressId: address.body._id, paymentMode: 'COD' }).expect(201)
    assert.equal(order.body.total, 270 + 5.55 + 5)
    assert.equal(order.body.item[0].quantity, 3)
    assert.equal(order.body.status, 'Pending')

    assert.equal((await Product.findById(product._id)).stockQuantity, 2)
    assert.equal((await agent.get('/cart').expect(200)).body.items.length, 0)

    await stranger.get(`/orders/${order.body._id}`).expect(404)
    await agent.get(`/orders/${order.body._id}`).expect(200)
    assert.equal((await agent.get('/orders/mine').expect(200)).body.length, 1)

    // cancelling puts the stock back, and only once
    await agent.patch(`/orders/${order.body._id}/cancel`).expect(200)
    assert.equal((await Product.findById(product._id)).stockQuantity, 5)
    await agent.patch(`/orders/${order.body._id}/cancel`).expect(400)
  })

  test('checkout fails cleanly when stock ran out after the item was added', async () => {
    const product = await createProduct({ stockQuantity: 2 })
    const { agent } = await signedInShopper('Late Buyer')
    const address = await agent.post('/address').send(newAddress).expect(201)

    await agent.post('/cart').send({ product: String(product._id), quantity: 2 }).expect(201)
    await Product.updateOne({ _id: product._id }, { stockQuantity: 1 })

    const res = await agent.post('/orders').send({ addressId: address.body._id, paymentMode: 'CARD' })
    assert.equal(res.status, 409)
    assert.equal((await Product.findById(product._id)).stockQuantity, 1)
    assert.equal((await agent.get('/cart').expect(200)).body.items.length, 1)
  })

  test('admins move orders through statuses but cannot reopen cancelled ones', async () => {
    const product = await createProduct({ stockQuantity: 4 })
    const { agent } = await signedInShopper('Status Buyer')
    const address = await agent.post('/address').send(newAddress).expect(201)
    await agent.post('/cart').send({ product: String(product._id), quantity: 1 }).expect(201)
    const order = await agent.post('/orders').send({ addressId: address.body._id, paymentMode: 'COD' }).expect(201)

    const admin = await signedInAdmin()
    const delivered = await admin.patch(`/orders/${order.body._id}/status`).send({ status: 'Delivered' }).expect(200)
    assert.equal(delivered.body.status, 'Delivered')
    await agent.patch(`/orders/${order.body._id}/cancel`).expect(400)
    await agent.patch(`/orders/${order.body._id}/status`).send({ status: 'Pending' }).expect(403)
    await admin.patch(`/orders/${order.body._id}/status`).send({ status: 'Shipped' }).expect(400)

    await admin.patch(`/orders/${order.body._id}/status`).send({ status: 'Cancelled' }).expect(200)
    await admin.patch(`/orders/${order.body._id}/status`).send({ status: 'Pending' }).expect(400)

    const all = await admin.get('/orders?limit=5').expect(200)
    assert.ok(all.body.total >= 1)
  })
})

describe('reviews', () => {
  test('one review per product, public data only, owner-only edits', async () => {
    const product = await createProduct()
    const { agent: author } = await signedInShopper('Review Author')
    const { agent: other } = await signedInShopper('Other Reader')

    const created = await author.post('/reviews').send({ product: String(product._id), rating: 4, comment: 'Solid phone' }).expect(201)
    assert.equal(created.body.user.name, 'Review Author')
    assert.equal(created.body.user.password, undefined)
    assert.equal(created.body.user.email, undefined)

    await author.post('/reviews').send({ product: String(product._id), rating: 5, comment: 'Again' }).expect(409)
    await other.post('/reviews').send({ product: String(product._id), rating: 2, comment: 'Not for me' }).expect(201)

    const list = await other.get(`/reviews/product/${product._id}`).expect(200)
    assert.equal(list.body.items.length, 2)
    assert.equal(list.body.summary.count, 2)
    assert.equal(list.body.summary.average, 3)
    assert.equal(list.body.summary.counts[4], 1)

    await other.patch(`/reviews/${created.body._id}`).send({ comment: 'hijacked' }).expect(404)
    await other.delete(`/reviews/${created.body._id}`).expect(404)
    await author.patch(`/reviews/${created.body._id}`).send({ rating: 5 }).expect(200)
    await author.delete(`/reviews/${created.body._id}`).expect(200)
  })
})

describe('wishlist and addresses', () => {
  test('wishlist adds are idempotent and scoped to the owner', async () => {
    const product = await createProduct()
    const { agent } = await signedInShopper('Wisher')
    const { agent: other } = await signedInShopper('Peeker')

    const first = await agent.post('/wishlist').send({ product: String(product._id) }).expect(201)
    const second = await agent.post('/wishlist').send({ product: String(product._id) }).expect(201)
    assert.equal(first.body._id, second.body._id)
    assert.equal((await agent.get('/wishlist').expect(200)).body.length, 1)

    await other.patch(`/wishlist/${first.body._id}`).send({ note: 'mine now' }).expect(404)
    const noted = await agent.patch(`/wishlist/${first.body._id}`).send({ note: 'birthday idea' }).expect(200)
    assert.equal(noted.body.note, 'birthday idea')
  })

  test('addresses are validated and scoped to the owner', async () => {
    const { agent } = await signedInShopper('Mover')
    const { agent: other } = await signedInShopper('Nosy')

    await agent.post('/address').send({ ...newAddress, phoneNumber: 'abc' }).expect(400)
    const address = await agent.post('/address').send(newAddress).expect(201)

    await other.patch(`/address/${address.body._id}`).send({ city: 'Goa' }).expect(404)
    assert.equal((await other.get('/address').expect(200)).body.length, 0)
    await agent.patch(`/address/${address.body._id}`).send({ city: 'Mumbai' }).expect(200)
    await agent.delete(`/address/${address.body._id}`).expect(200)
  })
})
