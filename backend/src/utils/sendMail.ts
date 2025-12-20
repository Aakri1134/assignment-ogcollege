import { Queue } from "bullmq"
import { Redis } from "ioredis"
import { config } from "dotenv"
import handleFailure from "./handleFailures.js"

const redis_url = process.env.REDIS_URL
if (redis_url === undefined) {
  handleFailure("fatal", "Unable to connect to Redis", "/utils/sendMail")
  process.exit(1)
}

const redis = new Redis(redis_url)

// for a more scalable system I qill separate the mails according to roles
const EmailQueue = new Queue("email", {
  connection: {
    host: "myredis.taskforce.run",
    port: 32856,
  },
})

/*
{
fails : 0,
email : string,
code : string
}
*/
export async function sendVerificationEmail(email: String, code: string) {
  EmailQueue.add("verification", { fails: 0, email, code })
}
