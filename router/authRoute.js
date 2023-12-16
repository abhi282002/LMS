import express from "express";
import {
  sign_in,
  sign_up,
  getUser,
  logout,
} from "../controller/authController.js";
import jwtAuth from "../middleware/jwtAuth.js";
const authRouter = express.Router();

authRouter.post("/sign_up", sign_up);
authRouter.post("/sign_in", sign_in);
authRouter.get("/user", jwtAuth, getUser);
authRouter.get("/logout", jwtAuth, logout);

export default authRouter;
