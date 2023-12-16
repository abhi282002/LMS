import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 5000;

import app from "./app.js";

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
