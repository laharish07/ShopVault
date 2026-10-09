const router = require('express').Router()
const controller = require('../controllers/Wishlist')
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const schemas = require('../validators')

router.use(protect)

router.get('/', controller.list)
router.post('/', validate.body(schemas.wishlistAdd), controller.add)
router.patch('/:id', validate.body(schemas.wishlistUpdate), controller.update)
router.delete('/:id', controller.remove)

module.exports = router
