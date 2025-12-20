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
