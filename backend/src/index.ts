import type { Request, Response, NextFunction } from "express"
import express from "express"

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
  return res.json({
    msg: "Hello World",
  })
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.status(500).json({
    success: false,
    message: err.message,
  })
})

app.listen(3000, () => {
  console.log("Running on PORT 3000")
})
