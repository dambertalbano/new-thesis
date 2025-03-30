import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";

// API for teacher Login
const loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!password) {
            return res.json({ success: false, message: "Password is required" });
        }

        const user = await teacherModel.findOne({ email }).select('+password').lean();

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ success: true, token });
    } catch (error) {
        console.error("Login error:", error);
        res.json({ success: false, message: error.message });
    }
};

// API for teacher Logout
const logoutTeacher = async (req, res) => {
    try {
        const teacherId = req.teacher.id;
        await teacherModel.findByIdAndUpdate(teacherId, { signOutTime: new Date() });
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get all teachers list for Frontend
const teacherList = async (req, res) => {
    try {
        const teachers = await teacherModel.find({}).select(['-password', '-email']);
        res.json({ success: true, teachers });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get teacher profile for Teacher Panel
const teacherProfile = async (req, res) => {
    try {
        const teacherId = req.teacher.id;

        // Check if teacherId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            console.log('Invalid teacherId');
            return res.status(400).json({ success: false, message: 'Invalid teacher ID' });
        }

        const profileData = await teacherModel.findById(teacherId).select('-password').lean();

        if (!profileData) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.json({ success: true, profileData });
    } catch (error) {
        console.error('Error fetching teacher profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to update teacher profile
const updateTeacherProfile = async (req, res) => {
    try {
        const { id } = req.teacher; // Assuming you have teacher info in req.teacher from authTeacher middleware
        const updates = req.body;

        const updatedTeacher = await teacherModel.findByIdAndUpdate(id, updates, {
            new: true, // Return the updated document
            runValidators: true // Ensure schema validation
        }).select('-password');

        if (!updatedTeacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', teacher: updatedTeacher });

    } catch (error) {
        console.error('Error updating teacher profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get students with the same education level, grade year level, and section as the teacher
const getStudentsByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Find the teacher by ID
        const teacher = await teacherModel.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        // Extract education level, grade year level, and section from the teacher's profile
        const { educationLevel, gradeYearLevel, section } = teacher;

        // Build the query to find matching students
        const query = {
            $or: [
                { educationLevel: { $in: educationLevel } },
                { gradeYearLevel: { $in: gradeYearLevel } },
                { section: { $in: section } }
            ]
        };

        // Find students matching the teacher's education level, grade year level, and section
        const students = await studentModel.find(query).select(['-password', '-email']);

        res.json({ success: true, students });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { getStudentsByTeacher, loginTeacher, logoutTeacher, teacherList, teacherProfile, updateTeacherProfile };

