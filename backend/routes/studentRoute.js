import express from 'express';
import { studentList, studentProfile, updateStudentProfile } from '../controllers/studentController.js';
import authStudent from '../middleware/authStudent.js';
const studentRouter = express.Router();

studentRouter.get("/list", studentList)
studentRouter.get("/profile", authStudent, studentProfile)
studentRouter.post("/update-profile", authStudent, updateStudentProfile)

export default studentRouter;