import { Router } from "express";
import loginRouter from "./login.js"

const router = Router()

router.use("/login", loginRouter)

export default router