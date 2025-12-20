import mongoose from "mongoose"

const slot = new mongoose.Schema({
    mentorId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Mentor'
    },
  workingHours: {
    type: new mongoose.Schema({
      0: { start: { type: String, default : "00:00" }, end: { type: String, default : "00:00" } },
      1: { start: { type: String, default : "00:00" }, end: { type: String, default : "00:00" } },
      2: { start: { type: String, default : "00:00" }, end: { type: String, default : "00:00" } },
      3: { start: { type: String, default : "00:00" }, end: { type: String, default : "00:00" } },
      4: { start: { type: String, default : "00:00" }, end: { type: String, default : "00:00" } },
      5: { start: { type: String, default : "00:00" }, end: { type: String, default : "00:00" } },
      6: { start: { type: String, default : "00:00" }, end: { type: String, default : "00:00" } },
    }),
  },
  timezone : {
    type : String,
    default : "IST"
  },
  price: {
    type: Number,
    required: true,
  },
})
const Slot = mongoose.model("Slot", slot)
export default Slot
