const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Otp = require('../models/OTP')
const PasswordResetToken = require('../models/PasswordResetToken')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { sendMail } = require('../utils/mailer')
const { sanitizeUser } = require('../utils/sanitizeUser')
const {
  setSessionCookie,
  clearSessionCookie,
  generateOtp,
  generateResetToken,
  hashToken,
} = require('../utils/tokens')
const { clientUrl, otpTtlMs, resetTtlMs } = require('../config/env')
const { APP_NAME, OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS } = require('../config/constants')

const minutes = (ms) => Math.round(ms / 60000)

const issueOtp = async (user) => {
  const code = generateOtp()

  await Otp.deleteMany({ user: user._id })
  await Otp.create({
    user: user._id,
    otp: await bcrypt.hash(code, 10),
    expiresAt: new Date(Date.now() + otpTtlMs),
  })

  const validFor = minutes(otpTtlMs)
  await sendMail({
    to: user.email,
    subject: `${code} is your ${APP_NAME} verification code`,
    text: `Your ${APP_NAME} verification code is ${code}. It is valid for ${validFor} minute(s). If you did not create an account, you can ignore this email.`,
    html: `<p>Your ${APP_NAME} verification code is:</p><p style="font-size:24px;letter-spacing:4px"><strong>${code}</strong></p><p>It is valid for ${validFor} minute(s). If you did not create an account, you can ignore this email.</p>`,
  })
}

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (await User.exists({ email })) {
    throw new AppError(409, 'An account with this email already exists')
  }

  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) })
  setSessionCookie(res, user._id)

  // The account exists either way; if the email fails the user can request a new code.
  await issueOtp(user).catch((error) => console.error('Could not send verification code:', error.message))

  res.status(201).json(sanitizeUser(user))
})

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, 'Incorrect email or password')
  }

  setSessionCookie(res, user._id)
  res.json(sanitizeUser(user))
})

exports.logout = (req, res) => {
  clearSessionCookie(res)
  res.json({ message: 'Signed out' })
}

exports.checkAuth = (req, res) => {
  res.json(sanitizeUser(req.user))
}

exports.resendOtp = asyncHandler(async (req, res) => {
  if (req.user.isVerified) throw new AppError(400, 'Your email is already verified')

  const existing = await Otp.findOne({ user: req.user._id })
  if (existing && Date.now() - existing.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
    throw new AppError(429, 'Please wait a few seconds before requesting another code')
  }

  await issueOtp(req.user)
  res.json({ message: `We sent a new code to ${req.user.email}` })
})

exports.verifyOtp = asyncHandler(async (req, res) => {
  if (req.user.isVerified) return res.json(sanitizeUser(req.user))

  const record = await Otp.findOne({ user: req.user._id })
  if (!record) throw new AppError(400, 'No active code, please request a new one')

  if (record.expiresAt < new Date() || record.attempts >= OTP_MAX_ATTEMPTS) {
    await record.deleteOne()
    throw new AppError(400, 'This code is no longer valid, please request a new one')
  }

  if (!(await bcrypt.compare(req.body.otp, record.otp))) {
    record.attempts += 1
    await record.save()
    throw new AppError(400, 'That code is not correct')
  }

  await record.deleteOne()
  req.user.isVerified = true
  await req.user.save()

  res.json(sanitizeUser(req.user))
})

exports.forgotPassword = asyncHandler(async (req, res) => {
  const genericResponse = { message: 'If an account exists for that email, a reset link is on its way.' }
  const user = await User.findOne({ email: req.body.email })

  if (!user) return res.json(genericResponse)

  const token = generateResetToken()
  await PasswordResetToken.deleteMany({ user: user._id })
  await PasswordResetToken.create({
    user: user._id,
    token: hashToken(token),
    expiresAt: new Date(Date.now() + resetTtlMs),
  })

  const link = `${clientUrl}/reset-password/${token}`
  const validFor = minutes(resetTtlMs)

  await sendMail({
    to: user.email,
    subject: `Reset your ${APP_NAME} password`,
    text: `Hi ${user.name},\n\nUse the link below to choose a new password. It is valid for ${validFor} minutes.\n\n${link}\n\nIf you did not ask for this, you can safely ignore this email.`,
    html: `<p>Hi ${user.name},</p><p>Use the link below to choose a new password. It is valid for ${validFor} minutes.</p><p><a href="${link}">Reset your password</a></p><p>If you did not ask for this, you can safely ignore this email.</p>`,
  })

  res.json(genericResponse)
})

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body

  const record = await PasswordResetToken.findOne({ token: hashToken(token), expiresAt: { $gt: new Date() } })
  if (!record) throw new AppError(400, 'This reset link is invalid or has expired')

  await User.updateOne({ _id: record.user }, { password: await bcrypt.hash(password, 10) })
  await PasswordResetToken.deleteMany({ user: record.user })

  res.json({ message: 'Your password has been updated, you can sign in now' })
})
