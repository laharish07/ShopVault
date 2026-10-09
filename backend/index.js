const app = require('./app')
const { connectToDB } = require('./database/db')
const { port } = require('./config/env')

const ready = connectToDB()

// On Vercel the platform invokes the exported app; everywhere else we listen ourselves.
if (!process.env.VERCEL) {
  ready
    .then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)))
    .catch(() => process.exit(1))
} else {
  ready.catch(() => {})
}

module.exports = app
