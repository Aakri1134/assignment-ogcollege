import mongoose from "mongoose"

const expertiseSchema = new mongoose.Schema({
    heading : {
        type : String,
        required : true
    },
    context : {
        type : String
    }
}, {
    _id : false
})

const mentor = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    qualification: {
      type: [String],
      required: true,
    },
    expertise: {
      type: [expertiseSchema],
      default : []
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slots",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)
