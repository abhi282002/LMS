import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 5000;
import cloudinary from "cloudinary";
import app from "./app.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
