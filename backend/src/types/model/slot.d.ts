import { Document, Model } from "mongoose"
import mongoose from "mongoose"

export interface ITimeSlot {
  start: string
  end: string
}

export interface IWorkingHours {
  0: ITimeSlot
  1: ITimeSlot
  2: ITimeSlot
  3: ITimeSlot
  4: ITimeSlot
  5: ITimeSlot
  6: ITimeSlot
}

export interface ISlot {
  mentorId: mongoose.Types.ObjectId
  workingHours: IWorkingHours
  timezone: string
  price: number
}

export interface ISlotMethods {}

export type SlotModel = Model<ISlot, {}, ISlotMethods>
