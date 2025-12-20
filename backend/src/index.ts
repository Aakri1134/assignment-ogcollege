import type { Request, Response, NextFunction } from "express"
import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./db/connect.js"

dotenv.config()
await connectDB()

const app = express()
const PORT = process.env.PORT

app.use(express.json())

app.get("/", (req, res) => {
  return res.json({
    msg: "Hello",
  })
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.status(500).json({
    success: false,
    message: err.message,
  })
})

app.listen(PORT ?? 3000, () => {
  console.log(`Running on PORT :: ${PORT}`)
})
