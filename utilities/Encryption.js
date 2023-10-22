import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const encryptPassword = ({ password }) => {
  if (password === undefined || password === null) {
    return;
  }
  if (typeof password !== "string") {
    password += "";
  }
  let encPassword = crypto.createHash("sha256").update(password).digest("hex");
  return encPassword;
};

export { encryptPassword };
