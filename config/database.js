import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
mongoose.set("strictQuery", false);

const databaseConnect = () => {
  mongoose
    .connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    .then((conn) => console.log(`connect to DB : ${conn.connection.host}`))
    .catch((err) => console.log(err));
};

export default databaseConnect;
