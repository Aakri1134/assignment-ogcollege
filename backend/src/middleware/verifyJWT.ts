import jwt from "jsonwebtoken"
import handleFailure from "../utils/handleFailures.js"
import type { Response, Request, NextFunction } from "express"

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token
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

    req.user = {
      emailVerified: decoded.emailVerified,
      email: decoded.email,
      id: decoded.id,
    }

    if (!decoded.emailVerified) {
      return res
        .status(401)
        .json({ error: "Email not verified, please verify your email" })
    }
    next()
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" })
  }
}
