const Brand = require('../models/Brand')
const Category = require('../models/Category')
const asyncHandler = require('../utils/asyncHandler')

exports.getBrands = asyncHandler(async (req, res) => {
  res.json(await Brand.find().sort('name'))
})

exports.getCategories = asyncHandler(async (req, res) => {
  res.json(await Category.find().sort('name'))
})
