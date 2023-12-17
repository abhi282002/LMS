import User from "../model/userSchema.js";
import bcrypt from "bcrypt";
import ApiError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
const cookieOption = {
  httpOnly: true,

  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sign_up = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return next(new ApiError("All fields are required", 400));
  }

  if (password !== confirmPassword) {
    return next(new ApiError("Password and Confirm Password not correct"));
  }
  try {
    const userInfo = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: email,
        secure_url:
          "https://cloudinary-marketing-res.cloudinary.com/images/w_1000,c_scale/v1679921049/Image_URL_header/Image_URL_header-png?_i=AA",
      },
    });
    if (!userInfo) {
      return next(
        new ApiError("User registration failed, please try again", 500)
      );
    }

    if (req.file) {
      console.log(req.file);
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });
        if (result) {
          userInfo.avatar.public_id = result.public_id;
          userInfo.avatar.secure_url = result.secure_url;
          //remove file from local system
          fs.rm(`upload/${req.file.filename}`);
        }
      } catch (error) {
        fs.rm(`upload/${req.file.filename}`);
        return next(
          new ApiError(
            error.message || "file not uploaded please try again",
            500
          )
        );
      }
    }
    await userInfo.save();
    userInfo.password = undefined;

    const token = userInfo.jwtToken();

    res.cookie("token", token, cookieOption);
    return res.status(200).json({
      success: true,
      message: "User Registered Successfully",
      data: userInfo,
    });
  } catch (error) {
    if (error.code === 11000) {
      next(new ApiError("Email already exit", 400));
    }
    return next(new ApiError(error.message, 500));
  }
};

const sign_in = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError("All fields are require", 400));
  }
  try {
    const user = await User.findOne({
      email,
    }).select("+password");
    if (!user || !bcrypt.compare(password, user.password)) {
      return next(new ApiError("Invalid Credential", 400));
    }
    const token = user.jwtToken();
    user.password = undefined;

    res.cookie("token", token, cookieOption);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(new ApiError(error.message, 500));
  }
};

const getUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    console.log(user);
    return res.status(200).json({
      success: true,
      message: "User Details",
      data: user,
    });
  } catch (error) {
    return next(new ApiError(error.message, 500));
  }
};

const logout = async (req, res) => {
  try {
    const cookieOption = {
      maxAge: new Date(),
      httpOnly: true,
    };
    res.cookie("token", null, cookieOption);
    return res.status(200).json({
      success: true,
      message: "Logout Successfully",
    });
  } catch (error) {
    return next(new ApiError("Logout unsuccessful", 500));
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError("Email is required", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError("Email not registered", 400));
  }
  const resetToken = await user.generatePasswordResetToken();
  await user.save();
  const resetPasswordURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail(email, subject, message);
    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email}`,
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    forgotPasswordExpiryDate = undefined;

    await user.save();
    next(new ApiError(error.message, 500));
  }
};

const resetPassword = () => {};
export { sign_up, sign_in, resetPassword, forgotPassword, getUser, logout };
