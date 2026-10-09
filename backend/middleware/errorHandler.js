const mongoose = require('mongoose')
const { ZodError } = require('zod')
const { isProduction } = require('../config/env')

exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: err.issues[0]?.message || 'Invalid request' })
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const first = Object.values(err.errors)[0]
    return res.status(400).json({ message: first?.message || 'Invalid request' })
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid ${err.path}` })
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'That record already exists' })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON body' })
  }

  if (err.isOperational) {
    return res.status(err.status).json({ message: err.message })
  }

  console.error(err)
  res.status(500).json({
    message: isProduction ? 'Something went wrong, please try again later' : err.message,
  })
}
