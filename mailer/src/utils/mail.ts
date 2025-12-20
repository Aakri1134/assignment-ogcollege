import { createTransport } from "nodemailer"
import handleFailure from "./handleFailures.js"

const email = process.env.EMAIL
const password = process.env.PASSWORD
const transporter = createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: email,
    pass: password,
  },
})

export const sendVerificationEmail = async (email: string, verificationToken : string) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "DEMO EMAIL SUBJECT",
    text: "DEMO TEXT",
  }

   transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      handleFailure(
        "basic",
        `Send message via nodemailer failed to ${email}\nError Message :: ${error}`,
        "sendVerificationEmail"
      )
    } else {
    //   console.log(`Mail sent to ${email}`)
    //   console.log(`RESPONSE :: ${info.response}`)
    }
  })
}
