import userModel from "../models/userModel.js";

export const getUserById = async (userId, res) => {
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(403).send({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).send({
      success: true,
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
