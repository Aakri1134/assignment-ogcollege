import { createTransport } from "nodemailer"
import handleFailure from "./handleFailures.js"
import { config } from "dotenv"

config()
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

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
) => {
  const verificationUrl = `${process.env.BACKEND_URL}/auth/verify-email?token=${verificationToken}`
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Email Verification</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:24px;">
            
            <tr>
              <td style="text-align:center;">
                <h1 style="color:#333333; margin-bottom:16px;">
                  Verify your email
                </h1>
              </td>
            </tr>

            <tr>
              <td style="color:#555555; font-size:16px; line-height:1.5;">
                <p>
                  Thanks for signing up! Please confirm your email address by clicking the button below.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:24px 0;">
                <a
                  href="${verificationUrl}"
                  style="
                    background-color:#2563eb;
                    color:#ffffff;
                    text-decoration:none;
                    padding:14px 24px;
                    border-radius:6px;
                    display:inline-block;
                    font-weight:bold;
                  "
                >
                  Verify Email
                </a>
              </td>
            </tr>

            <tr>
              <td style="color:#777777; font-size:14px;">
                <p>
                  This link will expire in <strong>24 hours</strong>.
                </p>
                <p>
                  If you didn't create an account, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="border-top:1px solid #eeeeee; padding-top:16px; font-size:12px; color:#999999;">
                <p>
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="word-break:break-all;">
                  ${verificationUrl}
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verification email demo",
    html: htmlTemplate,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return info
  } catch (error) {
    handleFailure(
      "basic",
      `Send message via nodemailer failed to ${email}\nError Message :: ${error}`,
      "sendVerificationEmail"
    )
    throw error
  }
}
export const sendConfirmationEmail = async (
  mentorName: string,
  userName: string,
  startTime: Date | string,
  endTime: Date | string,
  meetLink: string,
  userEmail: string,
  mentorEmail: string
) => {
  console.log("Function called")

  // ---------- NORMALIZE INPUTS ----------
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error(
      `Invalid date(s): start=${startTime}, end=${endTime}`
    )
  }

  // ---------- DATE FORMATTING ----------
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
  ]

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayName = days[start.getDay()]
  const monthName = months[start.getMonth()]
  const date = start.getDate()
  const year = start.getFullYear()

  let hours = start.getHours()
  const minutes = start.getMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"

  hours = hours % 12
  hours = hours === 0 ? 12 : hours

  const tzOffsetMin = start.getTimezoneOffset()
  const tzSign = tzOffsetMin <= 0 ? "+" : "-"
  const absOffset = Math.abs(tzOffsetMin)
  const tzHours = String(Math.floor(absOffset / 60)).padStart(2, "0")
  const tzMinutes = String(absOffset % 60).padStart(2, "0")

  const timezone = `GMT${tzSign}${tzHours}:${tzMinutes}`

  const formattedTime =
    `${dayName}, ${monthName} ${date}, ${year} ` +
    `at ${hours}:${minutes} ${ampm} (${timezone})`

  // ---------- ENV GUARD ----------
  if (!process.env.EMAIL) {
    throw new Error("EMAIL environment variable not set")
  }

  // ---------- USER EMAIL ----------
  const userMailOptions = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: `Your call with ${mentorName} is confirmed!`,
    html: `
      <p>Hi ${userName},</p>

      <p>
        Your meeting with <strong>${mentorName}</strong> is scheduled for
        <strong>${formattedTime}</strong>.
      </p>

      <p>
        A Google Meet link for the call is:<br/>
        <a href="${meetLink}">${meetLink}</a>
      </p>

      <p>
        We have also notified ${mentorName}.
        Please join the Meet at the scheduled time.
      </p>

      <p>
        Thanks,<br/>
        Mentor Scheduling Team
      </p>
    `,
  }

  // ---------- MENTOR EMAIL ----------
  const mentorMailOptions = {
    from: process.env.EMAIL,
    to: mentorEmail,
    subject: `New call scheduled by ${userName}`,
    html: `
      <p>Hello ${mentorName},</p>

      <p>
        <strong>${userName}</strong> has booked a call with you on
        <strong>${formattedTime}</strong>.
      </p>

      <p>
        The Google Meet link is:<br/>
        <a href="${meetLink}">${meetLink}</a>
      </p>

      <p>
        This appointment is now on your Google Calendar.
      </p>

      <p>
        Best,<br/>
        Mentor Scheduling System
      </p>
    `,
  }

  // ---------- SEND ----------
  try {
    await transporter.sendMail(userMailOptions)
    await transporter.sendMail(mentorMailOptions)
    console.log("Confirmation emails sent successfully")
  } catch (error) {
    console.error("Email send failed:", error)
    throw error
  }
}
