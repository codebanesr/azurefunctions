import mongoose from "mongoose";
import { UserModel } from "../utils/user.model";
import { getAccessTokenFromRefreshToken } from "../utils/get-access-from-refresh-token";

export async function getAccessTokenFromEmail(email: string) {
  await mongoose.connect(process.env.MONGO_URI, {});

  const user = await UserModel.findOne({ email }).lean().exec();

  await mongoose.disconnect();
  
  const { refreshToken } = user;
  let { accessToken } = user;

  accessToken =
    (await getAccessTokenFromRefreshToken({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      refreshToken,
    })) || accessToken;

  return accessToken;
}
