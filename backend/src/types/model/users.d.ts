import { Document, Model } from "mongoose";
import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  wallet: number;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  mentorID?: mongoose.Types.ObjectId;
  permissions: "admin" | "user";
  bookings?: {
    bookingID: any;
  };
  googleRefreshToken: String;
  timezone: String;
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
  generateVerificationToken(): string;
}

export type UserModel = Model<IUser, {}, IUserMethods>;