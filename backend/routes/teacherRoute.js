import express from 'express';
import { getStudentsByTeacher, loginTeacher, teacherList, teacherProfile, updateTeacherProfile } from '../controllers/teacherController.js'; // Import all controller functions
import authTeacher from '../middleware/authTeacher.js';
import teacherModel from '../models/teacherModel.js';

const teacherRouter = express.Router();

teacherRouter.post("/login", loginTeacher);
teacherRouter.get("/profile", authTeacher, teacherProfile);
teacherRouter.put("/update-profile", authTeacher, updateTeacherProfile); // Use PUT for updates
teacherRouter.get("/students", authTeacher, getStudentsByTeacher);

teacherRouter.get('/code/:code', async (req, res) => {
    try {
        const teacher = await teacherModel.findOne({ code: req.params.code });
        if (teacher) {
            res.json(teacher);
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (error) {
        console.error('Error fetching teacher by code:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export { getStudentsByTeacher, loginTeacher, teacherList, teacherProfile, updateTeacherProfile };
export default teacherRouter;