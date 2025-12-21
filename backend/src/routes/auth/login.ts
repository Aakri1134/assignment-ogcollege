import { Router } from "express"
import User from "../../db/models/user.js"
import { looseRateLimit } from "../../middleware/rateLimiting.js"

const router = Router()

router.post("/", looseRateLimit, async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    console.log("Hit Login")
    console.log(email)
    console.log(user)
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ msg: "Wrong Email or Password" })
    }
    const token = user.generateAuthToken()

    if (!user.emailVerified) {
      return res.status(401).json({
        success: false,
        error: "Login unsuccessful. Please verify your email.",
      })
    } else {
      console.log("RES.JSON")
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
        },
        msg: "Login successful.",
      })
    }
  } catch (err) {
    console.error((err as Error).message)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
