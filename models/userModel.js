import mongoose, { MongooseError } from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  user: {
    type: String,
    required: true,
    min: 4,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = new mongoose.model("User", userSchema);

export default User;
