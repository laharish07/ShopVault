const router = require('express').Router()
const controller = require('../controllers/Cart')
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const schemas = require('../validators')

router.use(protect)

router.get('/', controller.get)
router.post('/', validate.body(schemas.cartAdd), controller.add)
router.delete('/', controller.clear)
router.patch('/:id', validate.body(schemas.cartUpdate), controller.update)
router.delete('/:id', controller.remove)

module.exports = router
