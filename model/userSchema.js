const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "user name is Required"],
      minLength: [5, "Name must be greater than 5"],
      maxLength: [50, "Name must be less then 50"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      require: [true, "Email is Required"],
      unique: [true, "Already Registered"],
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    forgotPasswordToken: {
      type: String,
    },
    forPasswordExpiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods = {
  jwtToken() {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
      },
      process.env.SECRET,
      {
        expiresIn: "24h",
      }
    );
  },
};

const User = mongoose.model("User", userSchema);
module.exports = User;
