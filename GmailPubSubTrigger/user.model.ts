import mongoose from "mongoose";

export interface User {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

const userSchema = new mongoose.Schema<User>({
  userId: String,
  email: {
    type: String,
    unique: true,
  },
  accessToken: String,
  refreshToken: String,
});

userSchema.index({ accessToken: 1, refreshToken: 1 }, { unique: true });

export const UserModel = mongoose.model("User", userSchema, "User");
