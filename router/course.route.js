import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  getLectureByCourseId,
  updateCourse,
  removeCourse,
} from "../controller/course.controller.js";
import jwtAuth from "../middleware/jwtAuth.js";
import upload from "../middleware/multer.middleware.js";
const router = Router();

router
  .route("/")
  .get(getAllCourses)
  .post(jwtAuth, upload.single("thumbnail"), createCourse);
router
  .route("/:id")
  .get(jwtAuth, getLectureByCourseId)
  .put(updateCourse)
  .delete(removeCourse);

export default router;
