import express from "express";
import { isAdmin, isAuthenticated } from "./../middlewares/authMiddleware.js";
import {
  activeUser,
  loginController,
  registrationUser,
  logoutController,
  getUserInfoController,
  updateProfile,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.post("/registration", registrationUser);
userRoute.post("/activate-user", activeUser);
userRoute.post("/login", loginController);
userRoute.post("/logout", logoutController);
userRoute.get("/user-info", isAuthenticated, getUserInfoController);
userRoute.put("/update-profile", isAuthenticated, updateProfile);
userRoute.put("/update-user-role", isAuthenticated, isAdmin, updateUserRole);
userRoute.delete("/delete-user/:id", isAuthenticated, isAdmin, deleteUser);

export default userRoute;
