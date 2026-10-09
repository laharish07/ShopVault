const nodemailer = require('nodemailer')
const { mail, isProduction, isTest } = require('../config/env')
const { APP_NAME } = require('../config/constants')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: mail.user, pass: mail.pass },
})

// In tests we keep messages in memory so they can be inspected.
const outbox = []

const sendMail = async ({ to, subject, text, html }) => {
  if (isTest) {
    outbox.push({ to, subject, text, html })
    return
  }

  try {
    await transporter.sendMail({ from: `"${APP_NAME}" <${mail.user}>`, to, subject, text, html })
  } catch (error) {
    if (isProduction) throw error

    // Local development without working SMTP credentials: print the email instead.
    console.warn(`[mail] Could not send "${subject}" to ${to}: ${error.message}`)
    console.warn(`[mail] Message body:\n${text}\n`)
  }
}

module.exports = { sendMail, outbox }
