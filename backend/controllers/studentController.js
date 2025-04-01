import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import attendanceModel from "../models/attendanceModel.js"; // Import attendance model
import studentModel from "../models/studentModel.js";

const handleControllerError = (res, error, message = 'An error occurred') => {
    console.error(error);
    res.status(500).json({ success: false, message: message, error: error.message });
};

// API for student Login
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        const user = await studentModel.findOne({ email }).select('+password').lean();

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: 'student' }, process.env.JWT_SECRET); // Include role in token

        res.json({ success: true, token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const studentProfile = async (req, res) => {
    try {
        const studentId = req.student.id;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        const profileData = await studentModel.findById(studentId).select('-password').lean();

        if (!profileData) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, profileData });
    } catch (error) {
        handleControllerError(res, error, 'Error fetching student profile');
    }
};

// API to get all students list for Frontend
const studentList = async (req, res) => {
    try {
        const students = await studentModel.find({}).select(['-password', '-email']).lean();
        res.json({ success: true, students });
    } catch (error) {
        handleControllerError(res, error, 'Error getting student list');
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
        }).select('-password').lean();

        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', student: updatedStudent });

    } catch (error) {
        handleControllerError(res, error, 'Error updating student profile');
    }
};

// API to get students with the same education level, grade year level, and section as the student
const getStudentsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        const student = await studentModel.findById(studentId).lean();

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Extract education level, grade year level, and section from the student's profile
        const { educationLevel, gradeYearLevel, section } = student;

        // Build the query to find matching students
        const query = {
            educationLevel: educationLevel,
            gradeYearLevel: gradeYearLevel,
            section: section
        };

        // Find students matching the student's education level, grade year level, and section
        const students = await studentModel.find(query).select(['-password', '-email']).lean();

        res.json({ success: true, students });
    } catch (error) {
        handleControllerError(res, error, 'Error getting students by student');
    }
};

// API to get attendance records for the logged-in student
const getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.student.id;

        console.log("Student ID from req.student:", studentId);

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }

        // Find attendance records for the student
        const attendance = await attendanceModel.find({
            user: studentId,
            userType: 'Student'
        })
            .populate('user', 'firstName middleName lastName educationLevel gradeYearLevel section')
            .sort({ timestamp: 1 }) // Sort by timestamp
            .lean();

        console.log("Attendance records found:", attendance);

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'No attendance records found for this student' });
        }

        // Group attendance records by date
        const groupedAttendance = attendance.reduce((acc, record) => {
            const date = new Date(record.timestamp).toLocaleDateString();
            const existingRecord = acc.find(item => new Date(item.timestamp).toLocaleDateString() === date);

            if (existingRecord) {
                if (record.eventType === 'sign-in' && !existingRecord.signInTime) {
                    existingRecord.signInTime = record.timestamp;
                } else if (record.eventType === 'sign-out' && !existingRecord.signOutTime) {
                    existingRecord.signOutTime = record.timestamp;
                }
            } else {
                acc.push({
                    user: record.user,
                    date: record.timestamp,
                    signInTime: record.eventType === 'sign-in' ? record.timestamp : null,
                    signOutTime: record.eventType === 'sign-out' ? record.timestamp : null
                });
            }

            return acc;
        }, []);

        res.json({ success: true, attendance: groupedAttendance });
    } catch (error) {
        handleControllerError(res, error, 'Error getting student attendance');
    }
};

export { getStudentAttendance, getStudentsByStudent, loginStudent, studentList, studentProfile, updateStudentProfile };

