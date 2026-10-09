const mongoose = require('mongoose')
const { isProduction } = require('../config/env')
const { connectToDB } = require('../database/db')

const models = {
  User: require('../models/User'),
  Brand: require('../models/Brand'),
  Category: require('../models/Category'),
  Product: require('../models/Product'),
  Address: require('../models/Address'),
  Wishlist: require('../models/Wishlist'),
  Cart: require('../models/Cart'),
  Review: require('../models/Review'),
  Order: require('../models/Order'),
}

const seeders = [
  require('./Brand').seedBrand,
  require('./Category').seedCategory,
  require('./Product').seedProduct,
  require('./User').seedUser,
  require('./Address').seedAddress,
  require('./Wishlist').seedWishlist,
  require('./Cart').seedCart,
  require('./Review').seedReview,
  require('./Order').seedOrder,
]

const run = async () => {
  if (isProduction) {
    throw new Error('Refusing to seed while PRODUCTION=true, this script wipes every collection it touches.')
  }

  await connectToDB()

  console.log('Clearing existing data...')
  await Promise.all(Object.values(models).map((model) => model.deleteMany({})))
  await Promise.all(Object.values(models).map((model) => model.syncIndexes().catch(() => {})))

  for (const seeder of seeders) {
    await seeder()
  }

  console.log('Seed complete')
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
