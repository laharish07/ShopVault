const router = require('express').Router()
const controller = require('../controllers/Review')
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const schemas = require('../validators')

router.use(protect)

router.get('/product/:id', controller.listForProduct)
router.post('/', validate.body(schemas.reviewCreate), controller.create)
router.patch('/:id', validate.body(schemas.reviewUpdate), controller.update)
router.delete('/:id', controller.remove)

module.exports = router
