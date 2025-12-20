import { Document, Model } from "mongoose";
import mongoose from "mongoose";

export interface IReview {
  heading: string;
  comment?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  mentorID: mongoose.Types.ObjectId;
  userID: mongoose.Types.ObjectId;
  bookingID?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewMethods {}

export type ReviewModel = Model<IReview, {}, IReviewMethods>;