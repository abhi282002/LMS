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

const updateCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  try {
    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      {
        runValidators: true,
        new: true,
      }
    );
    if (!course) {
      return next(new ApiError("Course with given id does not exist", 400));
    }
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
    });
  } catch (error) {
    return next(new ApiError(error.message, 500));
  }
});

const removeCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return next(new ApiError("Course Does't exits", 400));
    }
    res.status(200).json({
      success: true,
      message: "Course Deleted Successfully",
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
});
const createAllLecturesById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;
  if (!title || !description) {
    return next(new ApiError("All fields are required"), 400);
  }
  const course = await Course.findById(id);
  if (!course) {
    return next(new ApiError("Course does't exist", 400));
  }
  let lectureData = {};
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file?.path, {
        folder: "lms",
        chunk_size: 50000000, // 50 mb size
        resource_type: "video",
      });
      console.log("Cloudinary Upload Result:", result);
      if (result) {
        lectureData.public_id = result?.public_id;
        lectureData.secure_url = result?.secure_url;
      }
      fs.rm(`upload/${req.file.filename}`);
    } catch (error) {
      fs.rm(`upload/${req.file.filename}`);
      return next(new ApiError("Error while uploading file", 500));
    }
    course.lectures.push({ title, description, lecture: lectureData });

    course.numbersOfLectures = course.lectures.length;
    await course.save();

    res.status(200).json({
      success: true,
      message: "Course Lecture added successfully",
      course,
    });
  }
});

const removeLectureById = asyncHandler(async (req, res, next) => {
  const { lectureId, courseId } = req.query;
  if (!lectureId || !courseId) {
    next(new ApiError("CourseId or Lecture Id does't present"));
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      next(new ApiError("Course does't exit"), 400);
    }
    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture._id.toString() === lectureId.toString()
    );
    if (lectureId === -1) {
      next(new ApiError("lecture not present", 400));
    }
    await cloudinary.v2.uploader.destroy(
      course.lectures[lectureIndex].lecture.public_id,
      {
        resource_type: "video",
      }
    );
    course.lectures.splice(lectureIndex, 1);
    course.numbersOfLectures = course.lectures.length;
    console.log(course.numbersOfLectures);
    await course.save();
    res.status(200).json({
      success: true,
      message: "Course lecture removed successfully",
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
});

export {
  removeCourse,
  createCourse,
  updateCourse,
  getAllCourses,
  getLectureByCourseId,
  createAllLecturesById,
  removeLectureById,
};
