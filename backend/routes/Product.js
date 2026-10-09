const router = require('express').Router()
const controller = require('../controllers/Product')
const { protect, requireAdmin } = require('../middleware/auth')
const validate = require('../middleware/validate')
const schemas = require('../validators')

router.use(protect)

router.get('/', validate.query(schemas.productQuery), controller.list)
router.get('/:id', controller.getById)

router.post('/', requireAdmin, validate.body(schemas.productCreate), controller.create)
router.patch('/:id', requireAdmin, validate.body(schemas.productUpdate), controller.update)
router.patch('/:id/restore', requireAdmin, controller.restore)
router.delete('/:id', requireAdmin, controller.remove)

module.exports = router
