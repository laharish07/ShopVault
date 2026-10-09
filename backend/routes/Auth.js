const router = require('express').Router()
const controller = require('../controllers/Auth')
const { authenticate } = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimit')
const validate = require('../middleware/validate')
const schemas = require('../validators')

router.post('/signup', authLimiter, validate.body(schemas.signup), controller.signup)
router.post('/login', authLimiter, validate.body(schemas.login), controller.login)
router.post('/logout', controller.logout)
router.get('/check-auth', authenticate, controller.checkAuth)

router.post('/resend-otp', authLimiter, authenticate, controller.resendOtp)
router.post('/verify-otp', authLimiter, authenticate, validate.body(schemas.verifyOtp), controller.verifyOtp)

router.post('/forgot-password', authLimiter, validate.body(schemas.forgotPassword), controller.forgotPassword)
router.post('/reset-password', authLimiter, validate.body(schemas.resetPassword), controller.resetPassword)

module.exports = router
