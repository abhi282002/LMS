const jwt = require("jsonwebtoken");

const jwtAuth = async (req, res, next) => {
  const token = (req.cookies && req.cookies.token) || null;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Not Authorize",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.SECRET);
    req.user = { id: payload._id, email: payload.email };
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  next();
};

module.exports = jwtAuth;
