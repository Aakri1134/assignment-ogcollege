import { Worker } from "bullmq"
import { sendVerificationEmail } from "./utils/mail.js"
import handleFailure from "./utils/handleFailures.js"
import { config } from "dotenv"

config()

const redis_url = process.env.REDIS_URL
if (redis_url === undefined) {
  handleFailure("fatal", "Unable to connect to Redis", "/utils/sendMail")
  process.exit(1)
}


const emailWorker = new Worker(
  "email",
  async (job) => {
    switch (job.name) {
      case "verification":
        const email = job.data.email
        const code = job.data.code
        await sendVerificationEmail(email, code)
        return ""
        break
      default:
        handleFailure("major", `INVALID DATA ::\n${job.name} ::\n ${job.data}`)
    }
  },
  {
    connection: {
      url: redis_url,
    },
  }
)

emailWorker.on("failed", (job) => {
    if(job?.attemptsMade && job?.attemptsMade >= 3){
        handleFailure("basic", `Email not sent :: ${job.data}`)
    }
})