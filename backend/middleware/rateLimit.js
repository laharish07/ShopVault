const rateLimit = require('express-rate-limit')
const { isTest } = require('../config/env')

// Applied to the endpoints that can be abused for guessing or spamming (login, OTP, reset).
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => isTest,
  message: { message: 'Too many attempts, please try again in a few minutes' },
})
