const User = require("../model/userSchema");
const emailValidator = require("email-validator");
const sign_up = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Every Field is required",
    });
  }
  const emailValid = emailValidator.validate(email);
  if (!emailValid) {
    return res.status(400).json({
      success: false,
      message: "Email is Not valid",
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password and Confirm password does't match",
    });
  }
  try {
    const userInfo = User(req.body);
    const result = await userInfo.save();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Account already exists with provided emailId",
      });
    }
    return res.status(400).json({
      success: false,
      message: e.message,
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
    if (!user || user.password !== password) {
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
module.exports = {
  sign_up,
  sign_in,
  getUser,
  logout,
};
