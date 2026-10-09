const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const { origins, isProduction, isTest } = require('./config/env')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const app = express()

// The API sits behind a proxy on most hosts; needed for secure cookies and rate limiting.
app.set('trust proxy', 1)

app.use(helmet())
app.use(cors({ origin: origins, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }))
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())
if (!isTest) app.use(morgan(isProduction ? 'combined' : 'dev'))

app.get('/', (req, res) => res.json({ status: 'ok' }))

app.use('/auth', require('./routes/Auth'))
app.use('/products', require('./routes/Product'))
app.use('/cart', require('./routes/Cart'))
app.use('/wishlist', require('./routes/Wishlist'))
app.use('/address', require('./routes/Address'))
app.use('/orders', require('./routes/Order'))
app.use('/reviews', require('./routes/Review'))
app.use('/', require('./routes/Catalog'))

app.use(notFound)
app.use(errorHandler)

module.exports = app
