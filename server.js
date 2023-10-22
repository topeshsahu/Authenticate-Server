import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import loginRoute from "./routes/users.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/login", loginRoute);
app.use("/register", loginRoute);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));
