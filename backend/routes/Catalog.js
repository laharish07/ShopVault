const router = require('express').Router()
const controller = require('../controllers/Catalog')
const { protect } = require('../middleware/auth')

router.get('/brands', protect, controller.getBrands)
router.get('/categories', protect, controller.getCategories)

module.exports = router
