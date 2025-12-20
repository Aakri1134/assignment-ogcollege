import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"

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

user.pre("save", async function () {
  if (!this.isModified("password")) return
  
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

user.methods.generateAuthToken = function () {
  const JWT_SECRET: string | undefined = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    console.log("Unable to access JWT_PASSWORD from env")
    process.exit(1)
  }

  return jwt.sign(
    { id: this._id, email: this.email, emailVerified: this.emailVerified },
    JWT_SECRET,
    { expiresIn: "1d" }
  )
}

user.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}

user.methods.generateVerificationToken = function () {
  const jti = uuidv4()
  const JWT_SECRET: string | undefined = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    console.log("Unable to access JWT_PASSWORD from env")
    process.exit(1)
  }
  const verificationToken = jwt.sign(
    { id: this._id, email: this.email, iss: "link-fixer", jti },
    JWT_SECRET,
    { expiresIn: "1d" }
  )

  this.verificationToken = verificationToken
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

  return verificationToken
}

const User = mongoose.model("User", user)
export default User
