import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

        console.log("Hashed password from database:", user.password);
        console.log("Plain text password from request:", password);

        const isMatch = await bcrypt.compare(password, user.password);

        console.log("bcrypt.compare result:", isMatch); // Add this line

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.json({ success: false, message: error.message });
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
        const { docId } = req.body;
        const profileData = await teacherModel.findById(docId).select('-password');
        res.json({ success: true, profileData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
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

export { getStudentsByTeacher, loginTeacher, teacherList, teacherProfile, updateTeacherProfile };
