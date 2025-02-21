import {
  signAccessToken,
  signRefreshToken,
} from "../middlewares/authMiddleware.js";

const accessTokenExpires = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);

const refreshTokenExpires = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

export const accessTokenOptions = {
  expires: new Date(Date.now() + accessTokenExpires * 60 * 60 * 1000), 
  //Cookie sẽ hết hạn sau số giờ được xác định bởi accessTokenExpires.
  maxAge: accessTokenExpires * 60 * 60 * 1000,
  //Xác định khoảng thời gian sống của cookie (tính bằng mili-giây).
  httpOnly: true,
  sameSite: "lax",
  secure: true,
};

export const refreshTokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpires * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpires * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
  secure: true,
};

export const sendToken = (user, status, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  return res.status(status).send({
    success: true,
    message: "Token generated successfully",
    user,
    accessToken,
    refreshToken,
  });
};
