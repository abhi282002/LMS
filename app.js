const express = require("express");
const app = express();
const authRoute = require("./router/authRoute");
const databaseConnect = require("./config/database");
const cookieParser = require("cookie-parser");

databaseConnect();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth/", authRoute);

app.use("/", (req, res) => {
  res.status(200).json({ name: "abhishke" });
});

module.exports = app;
