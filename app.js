import express from "express";
const app = express();
import authRoute from "./router/authRoute.js";
import databaseConnect from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import errorMiddleware from "./middleware/error.middleware.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
databaseConnect();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  })
);

app.use("/api/v1/user", authRoute);

app.use("/", (req, res) => {
  res.status(200).json({ name: "abhishek" });
});

app.all("*", (req, res) => {
  res.status(404).send("OOPS!! SOMETHING WENT WRONG");
});

app.use(errorMiddleware);
export default app;
