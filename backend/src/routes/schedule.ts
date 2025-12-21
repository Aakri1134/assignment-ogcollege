import { Router } from "express"
import { verifyJWT } from "../middleware/verifyJWT.js"
import { getCalendarClient } from "../utils/getCalendarClient.js"
import User from "../db/models/user.js"
import { v4 as uuidv4 } from "uuid"
import mongoose from "mongoose"
import Booking from "../db/models/booking.js"
import { enqueueConfirmationEmail } from "../utils/sendMail.js"
import { strictRateLimit } from "../middleware/rateLimiting.js"

const router = Router()

export async function createMentorEvent({
  calendar,
  startTime,
  endTime,
  mentorEmail,
  userEmail,
}: {
  calendar: any
  startTime: Date
  endTime: Date
  mentorEmail: string
  userEmail: string
}) {
  const event = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: "Mentor Call",
      description: "Scheduled via Mentor Platform",
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "UTC",
      },
      attendees: [{ email: mentorEmail }, { email: userEmail }],
      conferenceData: {
        createRequest: {
          requestId: uuidv4(),
        },
      },
    },
  })

  return {
    calendarEventID: event.data.id!,
    meetLink: event.data.hangoutLink!,
  }
}

router.post("/", verifyJWT, async (req, res) => {
  const userID = req.user?.id
  if (!userID) {
    return res.status(403).json({
      success: false,
      msg: "Unauthorized",
    })
  }
  const user = await User.findById(userID)
  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Unauthorized",
    })
  }
  const {
    startTime: startTimeString,
    endTime: endTimeString,
    mentorID,
  } = req.body
  const startTime = new Date(startTimeString)
  const endTime = new Date(endTimeString)

  const mentor = await User.findById(mentorID).populate("mentorID")
  if (!mentor) {
    return res.status(404).json({
      success: false,
      error: "Mentor not found",
    })
  }

  // add outside working hour check later

  const calendar = getCalendarClient(mentor.googleRefreshToken as string)

  const resFreeBusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      items: [{ id: "primary" }],
    },
  })

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    // checking using free busy
    const busy = resFreeBusy.data.calendars?.primary?.busy ?? []

    if (busy.length !== 0) {
      throw new Error("Intersection Schedule")
    }

    // creating Calendar event
    const { calendarEventID, meetLink } = await createMentorEvent({
      calendar: calendar,
      startTime,
      endTime,
      mentorEmail: mentor.email,
      userEmail: user.email,
    })

    // checking the database constraint
    const booking = new Booking({
      mentor: mentorID,
      startTime: startTime,

      user: userID,
      endTime: endTime,
      calendarEventID,
      meetLink,
      status: "upcoming",
    })

    await booking.save({ session })

    // @ts-ignore
    const price = mentor.mentorID.slot.price

    user.wallet = user.wallet - price
    await user.save({ session })

    mentor.wallet = mentor.wallet + price
    await mentor.save({ session })

    await enqueueConfirmationEmail(
      mentor.username,
      user.username,
      mentor.email,
      user.email,
      startTime,
      endTime,
      meetLink
    )

    await session.commitTransaction()
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    return res.status(500).json({
      success: false,
      error: "Unable to make booking",
      msg: (err as Error).message,
    })
  }
  session.endSession()
  return res.status(200).json({
    success: true,
    msg: "Booking Complete",
  })
})

export default router
