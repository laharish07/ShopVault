const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { secretKey, sessionDays, isProduction } = require('../config/env')

const DAY_MS = 24 * 60 * 60 * 1000

const signSession = (userId) => jwt.sign({ _id: userId }, secretKey, { expiresIn: `${sessionDays}d` })

const verifySession = (token) => jwt.verify(token, secretKey)

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
}

const setSessionCookie = (res, userId) => {
  res.cookie('token', signSession(userId), { ...cookieOptions, maxAge: sessionDays * DAY_MS })
}

const clearSessionCookie = (res) => {
  res.clearCookie('token', cookieOptions)
}

const generateOtp = () => crypto.randomInt(100000, 1000000).toString()

const generateResetToken = () => crypto.randomBytes(32).toString('hex')

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

module.exports = {
  verifySession,
  setSessionCookie,
  clearSessionCookie,
  generateOtp,
  generateResetToken,
  hashToken,
}
