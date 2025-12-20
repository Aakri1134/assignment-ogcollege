import { Document, Model } from "mongoose";
import mongoose from "mongoose";

export interface IBooking {
  mentor: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: "completed" | "missed" | "upcoming" | "cancelled";
  reviewID?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingMethods {}

export type BookingModel = Model<IBooking, {}, IBookingMethods>;