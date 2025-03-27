import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import studentModel from "../models/studentModel.js";

// API for student Login
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!password) {
            return res.json({ success: false, message: "Password is required" });
        }

        const user = await studentModel.findOne({ email }).select('+password').lean();

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

// API to get all students list for Frontend
const studentList = async (req, res) => {
    try {
        const students = await studentModel.find({}).select(['-password', '-email']);
        res.json({ success: true, students });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get student profile for Student Panel
const studentProfile = async (req, res) => {
    try {
        const { docId } = req.body;
        const profileData = await studentModel.findById(docId).select('-password');
        res.json({ success: true, profileData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to update student profile
const updateStudentProfile = async (req, res) => {
    try {
        const { id } = req.student; // Assuming you have student info in req.student from authStudent middleware
        const updates = req.body;

        const updatedStudent = await studentModel.findByIdAndUpdate(id, updates, {
            new: true, // Return the updated document
            runValidators: true // Ensure schema validation
        }).select('-password');

        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', student: updatedStudent });

    } catch (error) {
        console.error('Error updating student profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get students with the same education level, grade year level, and section as the student
const getStudentsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find the student by ID
        const student = await studentModel.findById(studentId);

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Extract education level, grade year level, and section from the student's profile
        const { educationLevel, gradeYearLevel, section } = student;

        // Build the query to find matching students
        const query = {
            $or: [
                { educationLevel: { $in: educationLevel } },
                { gradeYearLevel: { $in: gradeYearLevel } },
                { section: { $in: section } }
            ]
        };

        // Find students matching the student's education level, grade year level, and section
        const students = await studentModel.find(query).select(['-password', '-email']);

        res.json({ success: true, students });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { getStudentsByStudent, loginStudent, studentList, studentProfile, updateStudentProfile };

