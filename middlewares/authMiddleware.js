import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const signAccessToken = (id) => {
  return jwt.sign({ id: id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "5m",
  });
};

export const signRefreshToken = (id) => {
  return jwt.sign({ id: id }, process.env.REFRESH_TOKEN || "", {
    expiresIn: "3d",
  });
};

export const isAuthenticated = async (req, res, next) => {
  try {
    const access_token = req.cookies.access_token;

    if (!access_token) {
      return res.status(403).send({
        success: false,
        message: "Please login to access this resource",
      });
    }

    const decode = jwt.verify(access_token, process.env.ACCESS_TOKEN);
    if (!decode) {
      return res.status(403).send({
        success: false,
        message: "Invalid token",
      });
    }

    console.log(decode);

    const user = await userModel.findById(decode.id);

    if (!user) {
      return res.status(403).send({
        success: false,
        message: "User not found 2",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user?._id);
    if (user.role !== 1) {
      return res.status(404).send({
        success: false,
        message: "Unauthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};
