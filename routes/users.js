import express from "express";
import {
  loginByGoogle,
  loginBySite,
  registerUser,
} from "../controllers/users.js";
const route = express.Router();

// Login Routes
route.get("/login-by-google", loginByGoogle);
route.post("/login-by-site", loginBySite);

// Register Routes
route.post("/", registerUser);

export default route; 
