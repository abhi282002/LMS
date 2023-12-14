const express = require("express");
const {
  sign_up,
  getUser,
  sign_in,
  logout,
} = require("../controller/authController");
const jwtAuth = require("../middleware/jwtAuth");

const authRouter = express.Router();

authRouter.post("/sign_up", sign_up);
authRouter.post("/sign_in", sign_in);
authRouter.get("/user", jwtAuth, getUser);
authRouter.get("/logout", jwtAuth, logout);

module.exports = authRouter;
