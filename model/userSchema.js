import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
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
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please fill in a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiryDate: {
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
  generateJwtToken: async function () {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        subscription: this.subscription,
        role: this.role,
      },
      process.env.SECRET,
      {
        expiresIn: "24h",
      }
    );
  },
  generatePasswordResetToken: async function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.forgotPasswordExpiryDate = Date.now() + 15 * 60 * 1000; //15min from now
    return resetToken;
  },
};

const User = mongoose.model("User", userSchema);
export default User;
