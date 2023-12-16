import User from "../model/userSchema.js";
import bcrypt from "bcrypt";
import ApiError from "../utils/error.util.js";


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
    userInfo.password = undefined;
    return res.status(200).json({
      success: true,
      data: userInfo,
    });
  } catch (error) {
    if (error.code === 11000) {
      next(new ApiError("Email already exit", 400));
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const sign_in = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Every Field is required",
    });
  }
  try {
    const user = await User.findOne({
      email,
    }).select("+password");
    if (!user || !bcrypt.compare(password, user.password)) {
      return res.status(400).json({
        success: false,
        message: "InValid Credential",
      });
    }
    const token = user.jwtToken();
    user.password = undefined;
    const cookieOption = {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    };

    res.cookie("token", token, cookieOption);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    console.log(user);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
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
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export { sign_up, sign_in, getUser, logout };
