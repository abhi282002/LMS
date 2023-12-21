import jwt from "jsonwebtoken";
import ApiError from "../utils/error.util.js";

const jwtAuth = async (req, res, next) => {
  const token = (req.cookies && req.cookies.token) || null;

  if (!token) {
    return next(new ApiError("Not Authorize", 400));
  }

  try {
    const payload = await jwt.verify(token, process.env.SECRET);
    req.user = { id: payload._id, email: payload.email, role: payload.role };
  } catch (error) {
    return next(new ApiError(error.message, 500));
  }
  next();
};

export const authorizedRoles =
  (...roles) =>
  async (req, res, next) => {
    const currentUserRole = req.user.role;

    if (!roles.includes(currentUserRole)) {
      return next(
        new ApiError("You do not have permission to view this route", 403)
      );
    }
    next();
  };

export default jwtAuth;
