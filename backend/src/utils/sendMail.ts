import { Queue } from "bullmq"
import { config } from "dotenv"
import handleFailure from "./handleFailures.js"

config()

const redis_url = process.env.REDIS_URL
if (redis_url === undefined) {
  handleFailure("fatal", "Unable to connect to Redis", "/utils/sendMail")
  process.exit(1)
}

// for a more scalable system I will separate the mails according to roles
const EmailQueue = new Queue("email", {
  connection: {
    url: redis_url,
  },
})

/*
{
fails : 0,
email : string,
code : string
}
*/
export async function enqueueVerificationEmail(email: string, code: string) {
  await EmailQueue.add(
    "verification",
    { email, code },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    }
  )
}

export async function enqueueConfirmationEmail(
  mentorName: string,
  userName: string,
  mentorEmail: string,
  userEmail: string,
  startTime: Date,
  endTime: Date,
  meetLink: string
) {
  await EmailQueue.add(
    "confirmation",
    {
      mentorName,
      userName,
      mentorEmail,
      userEmail,
      startTime,
      endTime,
      meetLink,
    },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    }
  )
}
