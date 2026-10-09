const Address = require('../models/Address')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

exports.list = asyncHandler(async (req, res) => {
  res.json(await Address.find({ user: req.user._id }))
})

exports.create = asyncHandler(async (req, res) => {
  const address = await Address.create({ ...req.body, user: req.user._id })
  res.status(201).json(address)
})

exports.update = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  })

  if (!address) throw new AppError(404, 'Address not found')
  res.json(address)
})

exports.remove = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  if (!address) throw new AppError(404, 'Address not found')

  res.json(address)
})
