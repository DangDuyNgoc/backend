import jwt from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

import { sendMail } from "../config/sendMail.js";
import { sendToken } from "./../config/jwt.js";
import { hashPassword, matchPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import { getUserById } from "../services/userService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registrationUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name) {
    return res.status(201).send({
      success: false,
      message: "Name is required",
    });
  }

  if (!email) {
    return res.status(201).send({
      success: false,
      message: "Email is required",
    });
  }

  if (!password) {
    return res.status(201).send({
      success: false,
      message: "Password is required",
    });
  }

  try {
    const existing = await userModel.findOne({ email });

    if (existing) {
      return res.status(400).send({
        success: false,
        message: "Email already exists",
      });
    }

    const user = new userModel({
      name,
      email,
      password,
    });

    const token = await createToken(user);
    const activationCode = token.activationCode;

    const data = { user: { name: user.name }, activationCode };

    await ejs.renderFile(path.join(__dirname, "../mail/activeMail.ejs"), data);

    try {
      await sendMail({
        email: user.email,
        subject: "Activation your account",
        template: "activeMail.ejs",
        data,
      });

      return res.status(200).send({
        success: true,
        message: `Please check your email: ${user.email} to activate your account!`,
        activationToken: token.token,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Failed to send activation email",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// active user account
export const activeUser = async (req, res) => {
  try {
    const { activation_token, activation_code } = req.body;

    const newUser = jwt.verify(activation_token, process.env.JWT_SECRET);

    if (newUser.activationCode !== activation_code) {
      return res.status(401).send({
        success: false,
        message: "Invalid activation code",
      });
    }

    const { name, email, password } = newUser.user;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "Email already exists",
      });
    }

    const hash = await hashPassword(password);

    const user = await userModel.create({ name, email, password: hash });

    return res.status(200).send({
      success: true,
      message: "User account activated successfully",
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// login
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).send({
        success: false,
        message: "Please enter your email address and password",
      });
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    const match = await matchPassword(password, user.password);

    if (!match) {
      return res.status(400).send({
        success: false,
        message: "Invalid password",
      });
    }

    sendToken(user, 200, res);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// logout
export const logoutController = (req, res) => {
  try {
    res.cookie("access_token", "", { maxAge: 1 });
    res.cookie("refresh_token", "", { maxAge: 1 });

    return res.status(200).send({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// get user info
export const getUserInfoController = async (req, res) => {
  try {
    const userId = req.user?._id;
    await getUserById(userId, res);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// get all user
export const getAllUsers = async (req, res) => {
  try {
    const user = await userModel.find().sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "All Users Retrieved Successfully",
      users: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user?._id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    if (name && user) {
      user.name = name;
    }

    if (password) {
      const isSamePassword = await matchPassword(password, user.password);

      if (isSamePassword) {
        return res.status(400).send({
          success: false,
          message: "Password cannot be the same as the current password",
        });
      }
    }

    const hash = await hashPassword(password);
    user.password = hash;

    await user.save();

    return res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { email, role } = req.body;
    const userId = req.user?._id;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        message: "User not found or failed to update",
      });
    }

    return res.status(200).send({
      success: true,
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Failed to update user role",
    });
  }
};

// delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    await userModel.findByIdAndDelete(userId);

    return res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Failed to update user role",
    });
  }
};

const createToken = async (user) => {
  try {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign(
      {
        user,
        activationCode,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return { token, activationCode };
  } catch (error) {
    console.log(error);
    throw new Error("Token creation failed");
  }
};
