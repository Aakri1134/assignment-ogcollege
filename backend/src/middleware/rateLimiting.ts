import { Redis } from "ioredis"
import type { NextFunction, Request, Response } from "express"
import handleFailure from "../utils/handleFailures.js"

export async function hashValue(
  input: string,
  length: number = 16
): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length) // shorten for Redis key usage
}

const rateLimit = async (
  cooldown: number,
  max_attempts: number,
  ip: string
) => {
  try {
    const hashed = await hashValue(ip)

    const redis = new Redis(process.env.REDIS_URL || "")

    const cooldownKey = `ip:${hashed}:cooldown`
    const attemptsKey = `ip:${hashed}:attempts`

    const onCooldown = await redis.exists(cooldownKey)
    const attempts = await redis.incr(attemptsKey)
    if (onCooldown) {
      return {
        success: false,
        error: "Too many requests. Try again later.",
        status: 429,
      }
    }

    if (attempts === 1) {
      await redis.expire(attemptsKey, 60 * 60)
    }

    if (attempts > max_attempts) {
      await redis.set(cooldownKey, 1, "EX", cooldown)
      return {
        success: false,
        error: "Too many attempts. Slow down.",
        status: 429,
      }
    }

    return { success: true }
  } catch (err) {
    handleFailure("basic", (err as Error).message)
    return {
      success: false,
      error: "Internal Server Error.",
      status: 500,
    }
  }
}

export async function strictRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.ip) {
    const response = await rateLimit(10, 10, req.ip)
    if(response.success){
        next()
    }else{
        return res.status(response.status ?? 429).json({
            error : response.error,
            success : false
        })
    }
  }else{
    return res.status(500).send("Anonymous Proxy Detected")
  }
}


export async function midRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.ip) {
    const response = await rateLimit(10, 10, req.ip)
    if(response.success){
        next()
    }else{
        return res.status(response.status ?? 429).json({
            error : response.error,
            success : false
        })
    }
  }else{
    return res.status(500).send("Anonymous Proxy Detected")
  }
}

export async function looseRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.ip) {
    const response = await rateLimit(10, 10, req.ip)
    if(response.success){
        next()
    }else{
        return res.status(response.status ?? 429).json({
            error : response.error,
            success : false
        })
    }
  }else{
    return res.status(500).send("Anonymous Proxy Detected")
  }
}