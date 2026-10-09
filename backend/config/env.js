require('dotenv').config()

const required = ['MONGO_URI', 'SECRET_KEY', 'ORIGIN']
const missing = required.filter((key) => !process.env[key])

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
}

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

const origins = process.env.ORIGIN.split(',').map((origin) => origin.trim())

module.exports = {
  isProduction: process.env.PRODUCTION === 'true' || process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: toInt(process.env.PORT, 8000),
  mongoUri: process.env.MONGO_URI,
  secretKey: process.env.SECRET_KEY,
  origins,
  clientUrl: origins[0],
  sessionDays: toInt(process.env.COOKIE_EXPIRATION_DAYS, 30),
  otpTtlMs: toInt(process.env.OTP_EXPIRATION_TIME, 10 * 60 * 1000),
  resetTtlMs: toInt(process.env.PASSWORD_RESET_EXPIRATION_MINUTES, 30) * 60 * 1000,
  mail: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
}
