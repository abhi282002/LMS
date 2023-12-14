const mongoose = require("mongoose");
const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/my_database";

const databaseConnect = () => {
  mongoose
    .connect(MONGODB_URL)
    .then((conn) => console.log(`connect to DB : ${conn.connection.host}`))
    .catch((err) => console.log(err));
};

module.exports = databaseConnect;
