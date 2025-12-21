import mongoose from "mongoose"

const slot = new mongoose.Schema({
  workingHours: {
    type: new mongoose.Schema({
      0: {
        start: { type: String, default: "00:00" },
        end: { type: String, default: "00:00" },
      },
      1: {
        start: { type: String, default: "00:00" },
        end: { type: String, default: "00:00" },
      },
      2: {
        start: { type: String, default: "00:00" },
        end: { type: String, default: "00:00" },
      },
      3: {
        start: { type: String, default: "00:00" },
        end: { type: String, default: "00:00" },
      },
      4: {
        start: { type: String, default: "00:00" },
        end: { type: String, default: "00:00" },
      },
      5: {
        start: { type: String, default: "00:00" },
        end: { type: String, default: "00:00" },
      },
      6: {
        start: { type: String, default: "00:00" },
        end: { type: String, default: "00:00" },
      },
    }),
  },
  price: {
    type: Number,
    required: true,
  },
})

const expertiseSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    context: {
      type: String,
    },
  },
  {
    _id: false,
  }
)

const mentor = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique : true
    },
    college: {
      type: String,
      required: true,
    },
    collegeID: {
      type: String,
      required: true,
      unique: true,
    },
    courseEnrolled: {
      type: String,
      required: true,
    },
    expertise: {
      type: [expertiseSchema],
      default: [],
    },
    slot: {
      type: slot,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Mentor = mongoose.model("Mentor", mentor)
export default Mentor
