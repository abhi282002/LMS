import express from "express";
import {
  sign_in,
  sign_up,
  getUser,
  logout,
} from "../controller/authController.js";
import jwtAuth from "../middleware/jwtAuth.js";
import upload from "../middleware/multer.middleware.js";
const authRouter = express.Router();

authRouter.post("/sign_up", upload.single("avatar"), sign_up);
authRouter.post("/sign_in", sign_in);
authRouter.get("/user", jwtAuth, getUser);
authRouter.get("/logout", jwtAuth, logout);

export default authRouter;
