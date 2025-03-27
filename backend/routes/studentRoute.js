import express from 'express';
import { getStudentsByStudent, loginStudent, studentProfile, updateStudentProfile } from '../controllers/studentController.js';
import authStudent from '../middleware/authStudent.js';

const studentRouter = express.Router();

studentRouter.post("/login", loginStudent);
studentRouter.get("/profile", authStudent, studentProfile);
studentRouter.put("/update-profile", authStudent, updateStudentProfile); // Use PUT method
studentRouter.get("/students-by-student/:studentId", authStudent, getStudentsByStudent);

export default studentRouter;