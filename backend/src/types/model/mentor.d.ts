import { Document, Model } from "mongoose";
import mongoose from "mongoose";

export interface IExpertise {
  heading: string;
  context?: string;
}

export interface IMentor {
  userID: mongoose.Types.ObjectId;
  college: string;
  collegeID: string;
  courseEnrolled: string;
  qualification: string[];
  expertise: IExpertise[];
  slot?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMentorMethods {}

export type MentorModel = Model<IMentor, {}, IMentorMethods>;