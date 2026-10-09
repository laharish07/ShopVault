const bcrypt = require('bcryptjs')
const User = require('../models/User')

// Local development accounts only. The ids match the references in the other seed files.
const accounts = [
  { _id: '65b8e564ea5ce114184ccb96', name: 'Demo User', email: 'demo@gmail.com', password: 'Shop@1234' },
  { _id: '65c2526fdcd9253acfbaa731', name: 'Rishi Bakshi', email: 'demo2@gmail.com', password: 'Shop@1234' },
  { _id: '65c2526fdcd9253acfbaa7ff', name: 'Store Admin', email: 'admin@example.com', password: 'Admin@1234', isAdmin: true },
]

exports.seedUser = async () => {
  const users = await Promise.all(
    accounts.map(async ({ password, ...account }) => ({
      ...account,
      password: await bcrypt.hash(password, 10),
      isVerified: true,
    }))
  )

  await User.insertMany(users)
  console.log('Users seeded')
}
