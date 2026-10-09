// Parses and replaces req.body / req.query with the schema output (unknown keys are dropped).
exports.body = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body)
    next()
  } catch (error) {
    next(error)
  }
}

exports.query = (schema) => (req, res, next) => {
  try {
    req.validatedQuery = schema.parse(req.query)
    next()
  } catch (error) {
    next(error)
  }
}
