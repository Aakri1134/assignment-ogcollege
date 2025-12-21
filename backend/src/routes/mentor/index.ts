import { Router } from "express"
import { verifyJWT } from "../../middleware/verifyJWT.js"
import Mentor from "../../db/models/mentor.js"
import User from "../../db/models/user.js"
import mongoose from "mongoose"
import { convertTime } from "../../utils/timezoneConversion.js"
import { DateTime, Interval } from "luxon"
import { getCalendarClient } from "../../utils/getCalendarClient.js"
import Booking from "../../db/models/booking.js"

const router = Router()

const SLOT_DURATION_MIN = 30
const DAYS_AHEAD = 7
router.get("/:id/availability", verifyJWT, async (req: any, res) => {
  try {
    const mentorId = req.params.id
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await User.findById(userId).lean()
    if (!user || !user.timezone) {
      return res.status(400).json({ message: "User timezone not set" })
    }

    const userTimezone = user.timezone

    const mentor = await Mentor.findById(mentorId).populate({
      path: "userID",
      select: "googleRefreshToken timezone",
    })
    // @ts-ignore
    if (!mentor || !mentor.userID?.googleRefreshToken || !mentor.userID?.timezone) {
      return res.status(400).json({ message: "Mentor calendar not configured" })
    }
    // @ts-ignore
    const mentorTimezone = mentor.userID.timezone
    // @ts-ignore
    const calendar = getCalendarClient(mentor.userID.googleRefreshToken)

    const nowUTC = DateTime.utc()
    const endUTC = nowUTC.plus({ days: DAYS_AHEAD })

    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin: nowUTC.toISO(),
        timeMax: endUTC.toISO(),
        items: [{ id: "primary" }],
      },
    })

    const googleBusy: Interval[] =
      fb.data.calendars?.primary?.busy?.map(b =>
        Interval.fromDateTimes(
          DateTime.fromISO(b.start!, { zone: "utc" }),
          DateTime.fromISO(b.end!, { zone: "utc" })
        )
      ) || []

    const bookings = await Booking.find({
      mentor: mentor.userID._id,
      status: "upcoming",
      startTime: { $lt: endUTC.toJSDate() },
      endTime: { $gt: nowUTC.toJSDate() },
    }).lean()

    const bookingBusy: Interval[] = bookings.map(b =>
      Interval.fromDateTimes(
        DateTime.fromJSDate(b.startTime).toUTC(),
        DateTime.fromJSDate(b.endTime).toUTC()
      )
    )

    const busyIntervals = [...googleBusy, ...bookingBusy]

    const availability: Record<string, any[]> = {}

    const baseDay = DateTime.now()
      .setZone(mentorTimezone)
      .startOf("day")

    for (let d = 0; d < DAYS_AHEAD; d++) {
      const mentorDay = baseDay.plus({ days: d })
      const weekday = mentorDay.weekday % 7

      const wh = mentor.slot?.workingHours?.[
        weekday as keyof typeof mentor.slot.workingHours
      ]

      if (!wh?.start || !wh?.end) continue

      const [sh, sm] = wh.start.split(":").map(Number)
      const [eh, em] = wh.end.split(":").map(Number)

      let cursor = mentorDay.set({
        hour: sh,
        minute: sm,
        second: 0,
        millisecond: 0,
      })

      const dayEnd = mentorDay.set({
        hour: eh,
        minute: em,
        second: 0,
        millisecond: 0,
      })

      while (cursor.plus({ minutes: SLOT_DURATION_MIN }) <= dayEnd) {
        const slotUTC = Interval.fromDateTimes(
          cursor.toUTC(),
          cursor.plus({ minutes: SLOT_DURATION_MIN }).toUTC()
        )

        if (!busyIntervals.some(b => b.overlaps(slotUTC))) {
    // @ts-ignore
          const userStart = cursor.setZone(userTimezone)
          const userEnd = userStart.plus({ minutes: SLOT_DURATION_MIN })
          const key = userStart.toISODate()

          if (key) {
            availability[key] ||= []
            availability[key].push({
              start: userStart.toFormat("HH':'mm',' dd':'LLL':'yyyy"),
              startISO: userStart.toISO(),
              end: userEnd.toFormat("HH':'mm',' dd':'LLL':'yyyy"),
              endISO: userEnd.toISO(),
              price: mentor.slot.price,
            })
          }
        }

        cursor = cursor.plus({ minutes: SLOT_DURATION_MIN })
      }
    }

    return res.json({
      mentorId,
      mentorTimezone,
      userTimezone,
      availability,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Failed to compute availability" })
  }
})

router.post("/join", verifyJWT, async (req, res) => {
  const userID = req.user?.id
  if (!userID) {
    return res.status(403).json({
      success: false,
      msg: "Unauthorized",
    })
  }
  const { expertise, college, collegeID, courseEnrolled, slot } = req.body

  const user = await User.findById(userID)
  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Unauthorized",
    })
  }

  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const [mentor] = await Mentor.create(
      [
        {
          userID,
          expertise,
          college,
          collegeID,
          courseEnrolled,
          slot,
        },
      ],
      { session }
    )

    if (!mentor) {
      throw new Error("Failed to create mentor")
    }

    user.mentorID = mentor._id
    await user.save({ session })

    await session.commitTransaction()
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    return res.status(500).json({
      success: false,
      error: "Unable to save data",
    })
  }
  session.endSession()

  return res.status(200).json({
    success: true,
    msg: "User upgraded to mentor",
  })
})

router.get("/", verifyJWT, async (req, res) => {
  const { limit } = req.query

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

  let mentorList
  if (limit) {
    const lim = Number.parseInt(limit as string)
    mentorList = await Mentor.find()
      .select("expertise slot college collegeID userID")
      .populate({
        path: "userID",
        select: "username email timezone",
      })
      .limit(lim)
  } else
    mentorList = await Mentor.find()
      .select("expertise slot college collegeID userID")
      .populate({
        path: "userID",
        select: "username email timezone",
      })

  for (const mentor of mentorList) {
    //@ts-ignore
    if (mentor.userID && mentor.userID.timezone !== user.timezone) {
      if (mentor.slot && mentor.slot.workingHours) {
        for(const id of ["0", "1", "2", "3", "4", "5", "6"] as const){
        if (mentor.slot.workingHours[id] && mentor.slot.workingHours[id]?.start) {
          //@ts-ignore
          mentor.slot.workingHours[id].start = convertTime(mentor.slot.workingHours[id].start, mentor.userID.timezone, user.timezone).time 
        }
        if (mentor.slot.workingHours[id] && mentor.slot.workingHours[id]?.end) {
          //@ts-ignore
          mentor.slot.workingHours[id].end = convertTime(mentor.slot.workingHours[id].end, mentor.userID.timezone, user.timezone).time 
        }}
      }
    }
  }

  return res.status(200).json({
    success: true,
    mentors: mentorList,
  })
})

export default router
