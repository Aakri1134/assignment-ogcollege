import { Router } from "express"
import jwt from "jsonwebtoken"
import User from "../../db/models/user.js"
import handleFailure from "../../utils/handleFailures.js"

const router = Router()

router.get("/", async (req, res) => {
    console.log("Verification")
  const token = req.query.token as string | undefined

  if (!token) {
    return res.status(400).json({ error: "Invalid Link" })
  }

  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    handleFailure("fatal", "JWT cannot be accessed", "middleWare/verifyJWT")
    return res.json()
  }

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }
    if(user.email !== decoded.email){
        return res.status(403).json({
            msg : "Unauthorized"
        })
    }
    user.emailVerified = true

    await user.save()

    return res.send(`
        <html>
          <body>
            <h1>Email Verified Successfully!</h1>
            <p>You can now log in to your account.</p>
          </body>
        </html>
      `)
  } catch (err) {
    console.error((err as Error).message)
    res.status(500).json({ error: "Server error" })
  }
})

export default router