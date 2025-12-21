import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import User from "../db/models/user.js";
import Booking from "../db/models/booking.js";

const router = Router()

router.get("/", verifyJWT, async (req, res) => {
    const userID = req.user?.id
    if(!userID){
        return res.status(404).json({
            err : "sda"
        })
    }
    const user = await User.findById(userID)
    if(!user){
        return res.status(404).json({
            err : "sda"
        })
    }
    const bookings = await Booking.find({
        user : userID
    })
    return res.status(200).json({res : bookings})
})

export default router