import express from 'express';
import { loginTeacher, teacherProfile, updateTeacherProfile } from '../controllers/teacherController.js';
import authTeacher from '../middleware/authTeacher.js';
import teacherModel from '../models/teacherModel.js';

const teacherRouter = express.Router();

teacherRouter.post("/login", loginTeacher);
teacherRouter.get("/profile", authTeacher, teacherProfile);
teacherRouter.post("/update-profile", authTeacher, updateTeacherProfile); // Add the updateTeacherProfile function

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

export default teacherRouter;