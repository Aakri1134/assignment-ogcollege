import { Router } from "express";
import loginRouter from "./login.js"
import signupRoute from "./signup.js"
import verifyMailRoute from "./verifyMail.js"
import resendMailRoute from "./resendMail.js"
import googleRoute from "./google.js"

const router = Router()

router.use("/login", loginRouter)
router.use("/signup", signupRoute)
router.use("/verify-email", verifyMailRoute)
router.use("/resend-email", resendMailRoute)
router.use("/google", googleRoute)

export default router