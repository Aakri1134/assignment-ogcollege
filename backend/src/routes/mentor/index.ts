import { Router } from "express"
import { verifyJWT } from "../../middleware/verifyJWT.js"
import Mentor from "../../db/models/mentor.js"
import User from "../../db/models/user.js"
import mongoose from "mongoose"

const router = Router()

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
  const {limit} = req.query
  if(limit !== undefined && typeof limit !== "number"){
    return res.status(401).json({
      success : false,
      error : "Invalid request"
    })
  }

  let mentorList
  if(limit) mentorList = await Mentor.find().populate("userID").select("username email expertise slots college collegeID").limit(limit)
    else mentorList = await Mentor.find()

  return res.status(200).json({
    success : true,
    mentors : mentorList
  })
})

export default router