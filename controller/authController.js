import User from "../model/userSchema.js";
import bcrypt from "bcrypt";
import ApiError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
const cookieOption = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sign_up = asyncHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword, role } = req.body;
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
      role,
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
    const token = await userInfo.generateJwtToken();
    userInfo.password = undefined;

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
});

const sign_in = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError("All fields are require", 400));
  }
  try {
    const user = await User.findOne({
      email,
    }).select("+password");
    console.log(user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new ApiError("Invalid Credential", 400));
    }
    const token = await user.generateJwtToken();
    user.password = undefined;

    res.cookie("token", token, cookieOption);
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      data: user,
    });
  } catch (error) {
    return next(new ApiError(error.message, 500));
  }
});

const getUser = asyncHandler(async (req, res, next) => {
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
});

const logout = asyncHandler(async (req, res, next) => {
  try {
    const cookieOption = {
      maxAge: new Date(),
      httpOnly: true,
    };
    res.clearCookie("token", cookieOption);
    // res.cookie("token", null, cookieOption);
    return res.status(200).json({
      success: true,
      message: "Logout Successfully",
    });
  } catch (error) {
    return next(new ApiError("Logout unsuccessful", 500));
  }
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError("Email is required", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError("Email not registered", 400));
  }
  const resetToken = await user.generatePasswordResetToken();
  await user.save(); //to save forgotpasswordtoken and expiry in database
  const resetPasswordURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const subject = "Reset Password";

  const message = `<p>You can reset your password by clicking <a href="${resetPasswordURL}" target="_blank">Reset your password</a>.</p>
<p>If the above link does not work for some reason, then copy-paste this link in a new tab: <a href="${resetPasswordURL}" target="_blank">${resetPasswordURL}</a>.</p>
<p>If you have not requested this, kindly ignore.</p>`;

  try {
    await sendEmail(email, subject, message);
    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email}`,
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiryDate = undefined;

    await user.save();
    return next(
      new ApiError(error.message || "Error While Processing Email ", 500)
    );
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;

  const { password } = req.body;
  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiryDate: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ApiError("token is invalid or expired please tried again", 400)
    );
  }

  user.password = password;

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiryDate = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(
      new ApiError("Old password and new password are required", 400)
    );
  }
  const { id } = req.user;
  const user = await User.findById(id).select("+password");
  console.log(user);
  if (!user) {
    return next(new ApiError("Invalid User or User does not exist", 400));
  }
  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) {
    return next(new ApiError("Password does not match", 400));
  }
  user.password = newPassword;
  await user.save();
  user.password = undefined;
  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
    user,
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.user;
  const userInfo = await User.findById(id);
  if (!userInfo) {
    return next(new ApiError("Invalid User or User does not exist", 400));
  }
  if (name) {
    userInfo.name = name;
  }

  if (req.file) {
    console.log(req.file);
    await cloudinary.v2.uploader.destroy(userInfo.avatar.public_id);
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
        new ApiError(error.message || "file not uploaded please try again", 500)
      );
    }
  }

  await userInfo.save();
  res
    .status(200)
    .json({ success: true, message: "Profile Updated Successfully", userInfo });
});

export {
  sign_up,
  changePassword,
  updateProfile,
  sign_in,
  resetPassword,
  forgotPassword,
  getUser,
  logout,
};
