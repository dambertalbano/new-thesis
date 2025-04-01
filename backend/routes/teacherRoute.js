import express from 'express';
import { body } from 'express-validator';
import { addTeacherClassSchedule, addTeacherEducationLevel, addTeacherGradeYearLevel, addTeacherSection, addTeacherSubjects, editTeacherClassSchedule, editTeacherEducationLevel, editTeacherGradeYearLevel, editTeacherSubjects, getStudentsByTeacher, loginTeacher, logoutTeacher, removeTeacherClassSchedule, removeTeacherEducationLevel, removeTeacherGradeYearLevel, removeTeacherSection, removeTeacherSubjects, teacherProfile, updateTeacher, updateTeacherProfile } from '../controllers/teacherController.js'; // Import all controller functions
import authTeacher from '../middleware/authTeacher.js'; // Import auth middleware
import teacherModel from '../models/teacherModel.js';

const router = express.Router();

router.post("/login", loginTeacher);
router.post("/logout", authTeacher, logoutTeacher);
router.get("/profile", authTeacher, teacherProfile);
router.put("/profile", authTeacher, [
    body('firstName').optional().trim().escape(),
    body('middleName').optional().trim().escape(),
    body('lastName').optional().trim().escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('number').optional().isMobilePhone(),
    body('address').optional().trim().escape(),
    body('code').optional().trim().escape(),
], updateTeacherProfile);
router.get("/students", authTeacher, getStudentsByTeacher);

router.put('/:id', authTeacher, [  // Route for updating a teacher by ID
    body('firstName').optional().trim().escape(),
    body('middleName').optional().trim().escape(),
    body('lastName').optional().trim().escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('number').optional().isMobilePhone(),
    body('address').optional().trim().escape(),
    body('code').optional().trim().escape(),
], updateTeacher);

// Class Schedule Routes
router.post("/profile/class-schedule", authTeacher, addTeacherClassSchedule);
router.delete("/profile/class-schedule/:classScheduleId", authTeacher, removeTeacherClassSchedule);
router.put("/profile/class-schedule/:classScheduleId", authTeacher, editTeacherClassSchedule);

// Education Level Routes
router.post("/profile/education-level", authTeacher, addTeacherEducationLevel);
router.delete("/profile/education-level/:educationLevelId", authTeacher, removeTeacherEducationLevel);
router.put("/profile/education-level/:educationLevelId", authTeacher, editTeacherEducationLevel);

// Grade/Year Level Routes
router.post("/profile/grade-year-level", authTeacher, addTeacherGradeYearLevel);
router.delete("/profile/grade-year-level/:gradeYearLevelId", authTeacher, removeTeacherGradeYearLevel);
router.put("/profile/grade-year-level/:gradeYearLevelId", authTeacher, editTeacherGradeYearLevel);

// Section Routes
router.post("/profile/section", authTeacher, addTeacherSection);
router.delete("/profile/section/:sectionId", authTeacher, removeTeacherSection);

// Subjects Routes
router.post("/profile/subjects", authTeacher, addTeacherSubjects);
router.delete("/profile/subjects/:subjectsId", authTeacher, removeTeacherSubjects);
router.put("/profile/subjects/:subjectsId", authTeacher, editTeacherSubjects);

router.get('/code/:code', async (req, res) => {
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

export default router;