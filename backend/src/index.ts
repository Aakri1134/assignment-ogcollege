import type { Request, Response, NextFunction } from "express"
import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./db/connect.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth/index.js"
import { sendVerificationEmail } from "./utils/sendMail.js"

dotenv.config()
await connectDB()

const app = express()
const PORT = process.env.PORT

app.use(cookieParser())
app.use(express.json())

app.post("/send-mail", async (req, res) => {
  const {email} = req.body
  await sendVerificationEmail(email, "1234");
  return res.status(200).json({
    success : true,
    msg : "Email queued"
  })
})

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    msg: "OK",
  })
})

app.use("/auth", authRouter)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.status(500).json({
    success: false,
    message: err.message,
  })
})

app.listen(PORT ?? 3000, () => {
  console.log(`Running on PORT :: ${PORT}`)
})
