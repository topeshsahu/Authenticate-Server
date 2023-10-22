import axios from "axios";
import jsonwebtoken from "jsonwebtoken";
import qs from "qs";
import dotenv from "dotenv";
import { encryptPassword } from "../utilities/Encryption.js";
import { User, UserToken } from "../models/index.js";
dotenv.config();

// Login By Google

const getGoogleOauthToken = async ({ code }) => {
  const rootURl = process.env.GOOGLE_ACCESS_TOKEN_URL;

  const options = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URL,
    grant_type: "authorization_code",
  };
  try {
    const { data } = await axios.post(rootURl, qs.stringify(options), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return data;
  } catch (err) {
    console.log("Failed to fetch Google Oauth Tokens");
    throw new Error(err);
  }
};

const getGoogleUser = async ({ id_token, access_token }) => {
  try {
    const { data } = await axios.get(
      `${process.env.GOOGLE_USER_INFO_URL}&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    return data;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

const loginByGoogle = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      res.status(404).json({ message: "Didn't get the code from Google." });
    }
    const { access_token, refresh_token, expires_in, id_token } =
      await getGoogleOauthToken({ code });

    if (!access_token && !id_token) {
      res.status(404).json({ message: "Didn't get the access token." });
    }
    const { name, email, verified_email } = await getGoogleUser({
      id_token,
      access_token,
    });
    if (verified_email && email) {
      res.redirect(
        `http://localhost:3002/googleAuth?status=success&user=${name}&email=${email}&access_token=${access_token}&refresh_token=${refresh_token}`
      );
    } else {
      res.redirect(`http://localhost:3002/googleAuth?status=failure`);
    }
  } catch (error) {
    console.log("Error >> ", error);
  }
};

// Token Generation

const generateToken = ({ userId, type, expiresIn }) => {
  const payload = { userId, type };

  // Secret key for signing the token
  const secretKey = process.env.SECRET_KEY;

  // Create a JWT token
  const token = jsonwebtoken.sign(payload, secretKey, {
    expiresIn,
  });

  return token;
};

// Login By Site

const loginBySite = async (req, res) => {
  try {
    const { body: { email = "", password = "" } = {} } = req;
    if (!email || !password) {
      res.status(400).json({
        error: {
          message: "Required data is missing in the request",
        },
      });
    }

    const encryptedPassword = encryptPassword({ password });

    const userData = await User.findOne(
      {
        email: email,
        password: encryptedPassword,
      },
      { _id: 1 }
    );

    if (!userData) {
      res.status(404).json({
        error: {
          message: "User not Found",
        },
      });
    }

    const access_token = generateToken({
      userId: userData?._id,
      type: "access",
      expiresIn: "1h",
    });

    const refresh_token = generateToken({
      userId: userData?._id,
      type: "refresh",
      expiresIn: "10h",
    });
    const userTokenData = new UserToken({ refresh_token, user: userData?._id });
    await userTokenData.save();
    res.status(200).json({
      email,
      access_token,
      refresh_token,
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
};

// Register

const registerUser = async (req, res) => {
  try {
    const { body = {} } = req;
    const {
      firstName = "",
      middleName = "",
      lastName = "",
      email = "",
      password = "",
      user = "",
    } = body;

    if (!firstName || !email || !password || !user) {
      res.status(400).json({
        error: {
          message: "Required data is missing in the request",
        },
      });
    }

    const encryptedPassword = encryptPassword({ password });
    const userData = new User({
      firstName,
      lastName,
      middleName,
      email,
      password: encryptedPassword,
      user,
    });

    const savedUser = await userData.save();
    res.status(201).json({
      data: {
        user: savedUser.user,
        email: savedUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export {
  loginByGoogle,
  loginBySite,
  getGoogleOauthToken,
  getGoogleUser,
  registerUser,
};
