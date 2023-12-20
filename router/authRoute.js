import express, { Router } from "express";
import {
  sign_in,
  sign_up,
  getUser,
  logout,
  resetPassword,
  forgotPassword,
  changePassword,
  updateProfile,
} from "../controller/authController.js";
import jwtAuth from "../middleware/jwtAuth.js";
import upload from "../middleware/multer.middleware.js";
const authRouter = express.Router();

authRouter.post("/sign_up", upload.single("avatar"), sign_up);
authRouter.post("/sign_in", sign_in);
authRouter.get("/me", jwtAuth, getUser);
authRouter.get("/logout", jwtAuth, logout);
authRouter.post("/reset", forgotPassword);
authRouter.post("/reset/:resetToken", resetPassword);
authRouter.post("/change-password", jwtAuth, changePassword);
authRouter.put(
  "/updateProfile",
  jwtAuth,
  upload.single("avatar"),
  updateProfile
);
export default authRouter;
