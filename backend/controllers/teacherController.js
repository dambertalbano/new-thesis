import bcrypt from "bcrypt";
import { validationResult } from 'express-validator'; // Import validationResult
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import cloudinary from "../config/cloudinary.js"; // Import cloudinary configuration
import attendanceModel from "../models/attendanceModel.js"; // Import attendance model
import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";

const excludedFields = ['-password', '-email'];

// API for teacher Login
const loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        const user = await teacherModel.findOne({ email }).select('+password').lean();

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: 'teacher' }, process.env.JWT_SECRET); // Include role in token

        res.json({ success: true, token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API for teacher Logout
const logoutTeacher = async (req, res) => {
    try {
        const teacherId = req.teacher.id;
        // await teacherModel.findByIdAndUpdate(teacherId, { signOutTime: new Date() }); // Removed signOutTime
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get all teachers list for Frontend
const teacherList = async (req, res) => {
    try {
        const teachers = await teacherModel.find({}).select(excludedFields);
        res.json({ success: true, teachers });
    } catch (error) {
        console.error("Error fetching teacher list:", error);
        res.status(500).json({ success: false, message: error.message });
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

        console.log("Updates received:", updates); // Log the updates received from the frontend

        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation errors:", errors.array());
            return res.status(400).json({ success: false, message: errors.array() });
        }

        // Check if the image URL is present in the updates
        if (updates.image === undefined) {
            console.log("Image URL not present in updates, retaining existing image.");
            // If image is not in updates, remove it so it does not get overwritten
            delete updates.image;
        }

        const updatedTeacher = await teacherModel.findByIdAndUpdate(id, updates, {
            new: true, // Return the updated document
            runValidators: true // Ensure schema validation
        }).select('-password');

        if (!updatedTeacher) {
            console.log("Teacher not found with ID:", id);
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        console.log("Teacher profile updated successfully:", updatedTeacher);
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
        const { date } = req.query;

        // Find the teacher by ID
        const teacher = await teacherModel.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        // Extract teaching assignments from the teacher object
        const teachingAssignments = teacher.teachingAssignments;

        if (!teachingAssignments || teachingAssignments.length === 0) {
            return res.status(400).json({ success: false, message: "No teaching assignments found for this teacher" });
        }

        // Build an array of queries based on teaching assignments
        const assignmentQueries = teachingAssignments.map(assignment => ({
            educationLevel: { $regex: new RegExp(`^${assignment.educationLevel.trim()}$`, 'i') },
            gradeYearLevel: { $regex: new RegExp(`^${assignment.gradeYearLevel.trim()}$`, 'i') },
            section: { $regex: new RegExp(`^${assignment.section.trim()}$`, 'i') }
        }));

        // Combine the queries using $or
        let query = { $or: assignmentQueries };

        // Find students matching the specified criteria
        const students = await studentModel.find(query).select(['-password', '-email']);

        // Fetch attendance records for the students on the specified date
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const attendanceRecords = await attendanceModel.find({
                user: { $in: students.map(student => student._id) },
                timestamp: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).populate({
                path: 'user',
                select: 'firstName lastName middleName studentNumber position' // Select the fields you want
            });

            // Attach attendance records to the students
            const studentsWithAttendance = students.map(student => {
                const attendance = attendanceRecords.filter(record => record.user._id.toString() === student._id.toString());
                return {
                    ...student.toObject(),
                    attendance
                };
            });

            res.json({ success: true, students: studentsWithAttendance });
        } else {
            res.json({ success: true, students });
        }
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params; // Teacher ID from params
        const updates = req.body;

        // Check if the user is an admin or the teacher is updating their own profile
        if (req.teacher.role !== 'admin' && req.teacher.id !== id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array() });
        }

        const teacher = await teacherModel.findById(id);

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        // If a new image is provided, update the image
        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
            teacher.image = imageUpload.secure_url;
        }

        // Update the teacher's profile
        teacher.firstName = updates.firstName || teacher.firstName;
        teacher.middleName = updates.middleName || teacher.middleName;
        teacher.lastName = updates.lastName || teacher.lastName;
        teacher.email = updates.email || teacher.email;
        teacher.number = updates.number || teacher.number;
        teacher.address = updates.address || teacher.address;
        teacher.code = updates.code || teacher.code;

        // Save the updated teacher
        await teacher.save();

        res.status(200).json({ success: true, message: 'Teacher profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Teaching Assignments
const updateTeacherTeachingAssignments = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { teachingAssignments } = req.body; // Get the teaching assignments from the request body

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        // Generate _id for new teaching assignments
        const updatedAssignments = teachingAssignments.map(assignment => ({
            ...assignment,
            _id: assignment._id || new mongoose.Types.ObjectId()
        }));

        teacher.teachingAssignments = updatedAssignments; // Update the teaching assignments

        // Explicitly mark the teachingAssignments array as modified
        teacher.markModified('teachingAssignments');

        await teacher.save();

        res.status(200).json({ success: true, message: 'Teaching assignments updated successfully', teachingAssignments: teacher.teachingAssignments });
    } catch (error) {
        console.error("Error updating teaching assignments:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Class Schedule
const addTeacherClassSchedule = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { classSchedule } = req.body; // Get the class schedule from the request body

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.classSchedule.push(classSchedule); // Add the new class schedule
        await teacher.save();

        res.status(200).json({ success: true, message: 'Class schedule added successfully', classSchedule: teacher.classSchedule });
    } catch (error) {
        console.error("Error adding class schedule:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeTeacherClassSchedule = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { classScheduleId } = req.params; // Get the class schedule ID from the request parameters

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.classSchedule = teacher.classSchedule.filter(schedule => schedule._id.toString() !== classScheduleId); // Remove the class schedule
        await teacher.save();

        res.status(200).json({ success: true, message: 'Class schedule removed successfully', classSchedule: teacher.classSchedule });
    } catch (error) {
        console.error("Error removing class schedule:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const editTeacherClassSchedule = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { classScheduleId } = req.params; // Get the class schedule ID from the request parameters
        const { updatedClassSchedule } = req.body; // Get the updated class schedule from the request body

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const classScheduleIndex = teacher.classSchedule.findIndex(schedule => schedule._id.toString() === classScheduleId); // Find the index of the class schedule
        if (classScheduleIndex === -1) {
            return res.status(404).json({ success: false, message: 'Class schedule not found' });
        }

        teacher.classSchedule[classScheduleIndex] = updatedClassSchedule; // Update the class schedule
        await teacher.save();

        res.status(200).json({ success: true, message: 'Class schedule updated successfully', classSchedule: teacher.classSchedule });
    } catch (error) {
        console.error("Error editing class schedule:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Education Level
const addTeacherEducationLevel = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { educationLevel } = req.body; // Get the education level from the request body

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.educationLevel.push(educationLevel); // Add the new education level
        await teacher.save();

        res.status(200).json({ success: true, message: 'Education level added successfully', educationLevel: teacher.educationLevel });
    } catch (error) {
        console.error("Error adding education level:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeTeacherEducationLevel = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { educationLevelId } = req.params; // Get the education level ID from the request parameters

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.educationLevel = teacher.educationLevel.filter(level => level._id.toString() !== educationLevelId); // Remove the education level
        await teacher.save();

        res.status(200).json({ success: true, message: 'Education level removed successfully', educationLevel: teacher.educationLevel });
    } catch (error) {
        console.error("Error removing education level:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const editTeacherEducationLevel = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { educationLevelId } = req.params; // Get the education level ID from the request parameters
        const { updatedEducationLevel } = req.body; // Get the updated education level from the request body

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const educationLevelIndex = teacher.educationLevel.findIndex(level => level._id.toString() === educationLevelId); // Find the index of the education level
        if (educationLevelIndex === -1) {
            return res.status(404).json({ success: false, message: 'Education level not found' });
        }

        teacher.educationLevel[educationLevelIndex] = updatedEducationLevel; // Update the education level
        await teacher.save();

        res.status(200).json({ success: true, message: 'Education level updated successfully', educationLevel: teacher.educationLevel });
    } catch (error) {
        console.error("Error editing education level:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Grade/Year Level
const addTeacherGradeYearLevel = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { gradeYearLevel } = req.body; // Get the grade/year level from the request body

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.gradeYearLevel.push(gradeYearLevel); // Add the new grade/year level
        await teacher.save();

        res.status(200).json({ success: true, message: 'Grade/year level added successfully', gradeYearLevel: teacher.gradeYearLevel });
    } catch (error) {
        console.error("Error adding grade/year level:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeTeacherGradeYearLevel = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { gradeYearLevelId } = req.params; // Get the grade/year level ID from the request parameters

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.gradeYearLevel = teacher.gradeYearLevel.filter(level => level._id.toString() !== gradeYearLevelId); // Remove the grade/year level
        await teacher.save();

        res.status(200).json({ success: true, message: 'Grade/year level removed successfully', gradeYearLevel: teacher.gradeYearLevel });
    } catch (error) {
        console.error("Error removing grade/year level:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const editTeacherGradeYearLevel = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { gradeYearLevelId } = req.params; // Get the grade/year level ID from the request parameters
        const { updatedGradeYearLevel } = req.body; // Get the updated grade/year level from the request body

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const gradeYearLevelIndex = teacher.gradeYearLevel.findIndex(level => level._id.toString() === gradeYearLevelId); // Find the index of the grade/year level
        if (gradeYearLevelIndex === -1) {
            return res.status(404).json({ success: false, message: 'Grade/year level not found' });
        }

        teacher.gradeYearLevel[gradeYearLevelIndex] = updatedGradeYearLevel; // Update the grade/year level
        await teacher.save();

        res.status(200).json({ success: true, message: 'Grade/year level updated successfully', gradeYearLevel: teacher.gradeYearLevel });
    } catch (error) {
        console.error("Error editing grade/year level:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Section
const addTeacherSection = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { section } = req.body; // Get the section from the request body

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.section.push(section); // Add the new section
        await teacher.save();

        res.status(200).json({ success: true, message: 'Section added successfully', section: teacher.section });
    } catch (error) {
        console.error("Error adding section:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeTeacherSection = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { sectionId } = req.params; // Get the section ID from the request parameters

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.section = teacher.section.filter(s => s._id.toString() !== sectionId); // Remove the section
        await teacher.save();

        res.status(200).json({ success: true, message: 'Section removed successfully', section: teacher.section });
    } catch (error) {
        console.error("Error removing section:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Subjects
const addTeacherSubjects = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { subjects } = req.body; // Get the subjects from the request body

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.subjects.push(subjects); // Add the new subjects
        await teacher.save();

        res.status(200).json({ success: true, message: 'Subjects added successfully', subjects: teacher.subjects });
    } catch (error) {
        console.error("Error adding subjects:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeTeacherSubjects = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { subjectsId } = req.params; // Get the subjects ID from the request parameters

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.subjects = teacher.subjects.filter(s => s._id.toString() !== subjectsId); // Remove the subjects
        await teacher.save();

        res.status(200).json({ success: true, message: 'Subjects removed successfully', subjects: teacher.subjects });
    } catch (error) {
        console.error("Error removing subjects:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const editTeacherSubjects = async (req, res) => {
    try {
        const { id } = req.teacher; // Get teacher ID from the authenticated teacher
        const { subjectsId } = req.params; // Get the subjects ID from the request parameters
        const { updatedSubjects } = req.body; // Get the updated subjects from the request body

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const subjectsIndex = teacher.subjects.findIndex(s => s._id.toString() === subjectsId); // Find the index of the subjects
        if (subjectsIndex === -1) {
            return res.status(404).json({ success: false, message: 'Subjects not found' });
        }

        teacher.subjects[subjectsIndex] = updatedSubjects; // Update the subjects
        await teacher.save();

        res.status(200).json({ success: true, message: 'Subjects updated successfully', subjects: teacher.subjects });
    } catch (error) {
        console.error("Error editing subjects:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get attendance by date
const getAttendanceByDate = async (req, res) => {
    try {
        const date = new Date(req.query.date);

        if (isNaN(date.getTime())) {
            return res.status(400).json({ message: 'Invalid date format.  Please use ISO format.' });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const attendanceRecords = await Attendance.find({
            timestamp: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        }).populate({
            path: 'user',
            select: 'firstName lastName middleName studentNumber position' // Select the fields you want
        });

        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAttendanceRecords = async (req, res) => {
    try {
        const { date, userType } = req.query;

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required" });
        }

        // Create a Date object from the provided date string
        const isoDate = new Date(date);

        // Check if the date is valid
        if (isNaN(isoDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format. Please use ISO format." });
        }

        // Get the start and end of the day in ISO format
        const startOfDay = new Date(isoDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(isoDate);
        endOfDay.setHours(23, 59, 59, 999);

        let query = {
            timestamp: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        };

        if (userType) {
            query['userType'] = userType;
        }

        const attendanceRecords = await attendanceModel.find(query).populate({
            path: 'user',
            select: 'firstName lastName middleName studentNumber position' // Select the fields you want
        });

        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    addTeacherClassSchedule, addTeacherEducationLevel, addTeacherGradeYearLevel, addTeacherSection, addTeacherSubjects, editTeacherClassSchedule, editTeacherEducationLevel, editTeacherGradeYearLevel, editTeacherSubjects, getAttendanceByDate,
    getAttendanceRecords, getStudentsByTeacher, loginTeacher, logoutTeacher, removeTeacherClassSchedule, removeTeacherEducationLevel, removeTeacherGradeYearLevel, removeTeacherSection, removeTeacherSubjects, teacherList, teacherProfile, updateTeacher, updateTeacherProfile, updateTeacherTeachingAssignments
};
