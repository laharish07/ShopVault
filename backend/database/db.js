const mongoose = require('mongoose')
const { mongoUri } = require('../config/env')

exports.connectToDB = async () => {
  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    throw error
  }
}
