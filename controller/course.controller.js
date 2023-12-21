import asyncHandler from "../middleware/asyncHandler.middleware.js";
import { Course } from "../model/course.model.js";
import ApiError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
const getAllCourses = asyncHandler(async (req, res, next) => {
  try {
    const courses = await Course.find().select("-lectures");
    console.log(courses);

    res.status(200).json({
      success: true,
      message: "All Courses",
      courses,
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
});

const getLectureByCourseId = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      next(new ApiError("Invalid User Id", 400));
    }
    res.status(200).json({
      success: true,
      message: "Course lectures fetched successfully",
      lectures: course.lectures,
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
});

const createCourse = asyncHandler(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;
  if (
    [title, description, category, createdBy].some((ele) => ele.trim() === "")
  ) {
    return next(new ApiError("All fields are required", 400));
  }

  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
  });
  console.log(course);
  if (!course) {
    return next(
      new ApiError("Course could not be created, please try again", 500)
    );
  }

  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file?.path, {
        folder: "lms",
      });

      if (result) {
        course.thumbnail.public_id = result?.public_id;
        course.thumbnail.secure_url = result?.secure_url;
      }
      fs.rm(`upload/${req.file.filename}`);
    } catch (error) {
      fs.rm(`upload/${req.file.filename}`);
      return next(new ApiError("Error while uploading file", 500));
    }
  }
  await course.save();
  res.status(200).json({
    success: true,
    message: "Course Created Successfully",
    course,
  });
});

const updateCourse = asyncHandler(async (req, res) => {});

const removeCourse = asyncHandler(async (req, res) => {});
export {
  removeCourse,
  createCourse,
  updateCourse,
  getAllCourses,
  getLectureByCourseId,
};
