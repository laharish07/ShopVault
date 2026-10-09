const User = require('../models/User')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { verifySession } = require('../utils/tokens')

// Loads the user behind the session cookie. The user is read from the database on every
// request so role and verification changes take effect immediately.
exports.authenticate = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies

  if (!token) throw new AppError(401, 'Please sign in to continue')

  let payload
  try {
    payload = verifySession(token)
  } catch {
    throw new AppError(401, 'Your session has expired, please sign in again')
  }

  const user = await User.findById(payload._id)
  if (!user) throw new AppError(401, 'Your session is no longer valid, please sign in again')

  req.user = user
  next()
})

exports.requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return next(new AppError(403, 'Please verify your email address to continue'))
  }
  next()
}

exports.requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new AppError(403, 'You do not have permission to do that'))
  }
  next()
}

// Shorthand for the common case: signed in and verified.
exports.protect = [exports.authenticate, exports.requireVerified]
