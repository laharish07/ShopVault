const router = require('express').Router()
const controller = require('../controllers/Order')
const { protect, requireAdmin } = require('../middleware/auth')
const validate = require('../middleware/validate')
const schemas = require('../validators')

router.use(protect)

router.post('/', validate.body(schemas.orderCreate), controller.create)
router.get('/mine', controller.listMine)
router.get('/', requireAdmin, validate.query(schemas.orderQuery), controller.listAll)
router.get('/:id', controller.getById)
router.patch('/:id/cancel', controller.cancel)
router.patch('/:id/status', requireAdmin, validate.body(schemas.orderStatus), controller.updateStatus)

module.exports = router
