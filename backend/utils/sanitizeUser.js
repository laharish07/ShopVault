exports.sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isVerified: user.isVerified,
  isAdmin: user.isAdmin,
})
