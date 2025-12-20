import mongoose from "mongoose"

const user = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    wallet: {
      type: Number,
      required: true,
      default: 0,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    mentorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
    },
    permissions: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      default: "user",
    },
    bookings: {
      type: new mongoose.Schema({
        bookingID: {},
      }),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)
const User = mongoose.model("User", user)
export default User
