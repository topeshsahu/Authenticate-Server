import mongoose from "mongoose";

const { Schema } = mongoose;

const tokenSchema = new Schema({
  refresh_token: String,
  user: { type: "ObjectId", ref: "User", required: true },
});

const UserToken = mongoose.model("UserTokens", tokenSchema);

export default UserToken;
