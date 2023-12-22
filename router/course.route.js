import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  getLectureByCourseId,
  updateCourse,
  removeCourse,
  createAllLecturesById,
  removeLectureById,
} from "../controller/course.controller.js";
import jwtAuth, { authorizedRoles } from "../middleware/jwtAuth.js";
import upload from "../middleware/multer.middleware.js";
const router = Router();
router
  .route("/")
  .get(jwtAuth, getAllCourses)
  .post(
    jwtAuth,
    authorizedRoles("ADMIN"),
    upload.single("thumbnail"),
    createCourse
  )
  .delete(jwtAuth, authorizedRoles("ADMIN"), removeLectureById);
router
  .route("/:id")
  .get(jwtAuth, getLectureByCourseId)
  .put(jwtAuth, authorizedRoles("ADMIN"), updateCourse)
  .delete(jwtAuth, authorizedRoles("ADMIN"), removeCourse)
  .post(
    jwtAuth,
    authorizedRoles("ADMIN"),
    upload.single("lecture"),
    createAllLecturesById
  );

export default router;
