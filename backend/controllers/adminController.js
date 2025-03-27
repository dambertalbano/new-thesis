import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import validator from "validator";
import Attendance from "../models/attendanceModel.js";
import employeeModel from "../models/employeeModel.js"; // Import employee model
import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if credentials match the environment variables
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Sign the JWT with email as payload
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '4h' });
            return res.status(200).json({ success: true, token });
        }

        res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reusable function for finding users by code
const findUserByCode = async (code) => {
    let user = await studentModel.findOne({ code });
    if (!user) user = await teacherModel.findOne({ code });
    if (!user) user = await employeeModel.findOne({ code }); // Check employee model
    return user;
};

// API for signing in a user
const adminSignIn = async (req, res) => {
    try {
        const { code } = req.params;
        let user = await studentModel.findOne({ code });
        let userType = 'Student';
        if (!user) {
            user = await teacherModel.findOne({ code });
            userType = 'Teacher';
        }
        if (!user) {
            user = await employeeModel.findOne({ code }); // Check employee model
            userType = 'Employee';
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.signInTime = Date.now();
        await user.save();

        const attendanceRecord = new Attendance({
            user: user._id,
            userType: userType, // Add the userType
            eventType: "sign-in",
        });
        await attendanceRecord.save();

        res.status(200).json({ success: true, message: "Sign in successful" });
    } catch (error) {
        console.error("Error signing in:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Similar changes for adminSignOut
const adminSignOut = async (req, res) => {
    try {
        const { code } = req.params;
        let user = await studentModel.findOne({ code });
        let userType = 'Student';
        if (!user) {
            user = await teacherModel.findOne({ code });
            userType = 'Teacher';
        }
        if (!user) {
            user = await employeeModel.findOne({ code }); // Check employee model
            userType = 'Employee';
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.signOutTime = Date.now();
        await user.save();

        const attendanceRecord = new Attendance({
            user: user._id,
            userType: userType, // Add the userType
            eventType: "sign-out",
        });
        await attendanceRecord.save();

        res.status(200).json({ success: true, message: "Sign out successful" });
    } catch (error) {
        console.error("Error signing out:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const addStudent = async (req, res) => {
    try {
        const { studentNumber, code, firstName, middleName, lastName, email, password, number, address, educationLevel, gradeYearLevel, section } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        if (!studentNumber || !firstName || !lastName || !email || !password || !number || !code || !educationLevel || !gradeYearLevel || !section) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const userData = {
            studentNumber,
            code,
            firstName,
            middleName,
            lastName,
            email,
            image: imageUrl,
            password: hashedPassword,
            number,
            address,
            educationLevel,
            gradeYearLevel,
            section,
            date: Date.now()
        };

        const newStudent = new studentModel(userData);
        await newStudent.save();
        res.status(201).json({ success: true, message: `Student Added` });
    } catch (error) {
        console.error(`Error adding Student:`, error);
        if (error.name === 'ValidationError') {
            // Mongoose validation error
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ success: false, message: 'Validation error', errors });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const addTeacher = async (req, res) => {
    try {
        const { code, firstName, middleName, lastName, email, password, number, address } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        if (!firstName || !lastName || !email || !password || !number || !code) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Please enter a strong password" });
        }

        // Hash the password using bcrypt (bcrypt handles salt generation)
        const hashedPassword = await bcrypt.hash(password, 10);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const userData = {
            code,
            firstName,
            middleName,
            lastName,
            email,
            image: imageUrl,
            password: hashedPassword,
            number,
            address,
            date: Date.now()
        };

        const newTeacher = new teacherModel(userData);
        await newTeacher.save();
        res.status(201).json({ success: true, message: `Teacher Added` });
    } catch (error) {
        console.error(`Error adding Teacher:`, error);
        if (error.name === 'ValidationError') {
            // Mongoose validation error
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ success: false, message: 'Validation error', errors });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to add employee
const addEmployee = async (req, res) => {
    try {
        const { code, firstName, middleName, lastName, email, password, number, address, position } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        if (!firstName || !lastName || !email || !password || !number || !code || !position) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Upload the image to Cloudinary from the buffer
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const userData = {
            code,
            firstName,
            middleName,
            lastName,
            email,
            image: imageUrl,
            password: hashedPassword,
            number,
            address,
            position,
            date: Date.now()
        };

        const newEmployee = new employeeModel(userData);
        await newEmployee.save();
        res.status(201).json({ success: true, message: `Employee Added` });
    } catch (error) {
        console.error(`Error adding Employee:`, error);
        if (error.name === 'ValidationError') {
            // Mongoose validation error
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ success: false, message: 'Validation error', errors });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get all users list
const getAllUsers = async (req, res, Model, userType) => {
    try {
        const users = await Model.find({}).select('-password');
        res.status(200).json({ success: true, [userType]: users });
    } catch (error) {
        console.error(`Error fetching ${userType}:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get all students list for admin panel
const allStudents = async (req, res) => {
    getAllUsers(req, res, studentModel, 'students');
};

// API to get all teachers list for admin panel
const allTeachers = async (req, res) => {
    getAllUsers(req, res, teacherModel, 'teachers');
};

// API to get all employees list for admin panel
const allEmployees = async (req, res) => {
    getAllUsers(req, res, employeeModel, 'employees');
};

const getStudentByCode = async (req, res) => {
    try {
        const { code } = req.params;
        console.log(`Received request for student with code: ${code}`);  // Log for debugging

        const student = await studentModel.findOne({ code }).select('-password');

        if (student) {
            res.status(200).json({ success: true, student });
        } else {
            res.status(404).json({ success: false, message: 'Student not found' });
        }
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const students = await studentModel.countDocuments({});
        const teachers = await teacherModel.countDocuments({});
        const employees = await employeeModel.countDocuments({}); // Count employees

        const dashData = {
            students,
            teachers,
            employees, // Add employees count to dashboard data
        };

        res.status(200).json({ success: true, dashData });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get user information by code
const getUserByCode = async (req, res) => {
    const { code } = req.params;

    try {
        // Find the user by code in any of the user models
        let user = await studentModel.findOne({ code });
        if (!user) user = await teacherModel.findOne({ code });
        if (!user) user = await employeeModel.findOne({ code }); // Check employee model

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const today = new Date();
        const signInDate = user.signInTime ? new Date(user.signInTime) : null;

        // Check if it's a new day
        if (signInDate && (today.getFullYear() !== signInDate.getFullYear() ||
            today.getMonth() !== signInDate.getMonth() ||
            today.getDate() !== signInDate.getDate())) {
            // Reset signInTime and signOutTime
            user.signInTime = null;
            user.signOutTime = null;
            await user.save();
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user by code:", error);
        res.status(500).json({ success: false, message: "Error fetching user" });
    }
};

// Generic function to delete a user
const deleteUser = async (req, res, model, userType) => {
    try {
        const userId = req.params.id;
        const deletedUser = await model.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: `${userType} not found` });
        }

        res.status(200).json({ success: true, message: `${userType} deleted successfully` });
    } catch (error) {
        console.error(`Error deleting ${userType}:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generic function to update a user
const updateUser = async (req, res, model, userType) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;

        const updatedUser = await model.findByIdAndUpdate(userId, updatedData, {
            new: true, // Return the updated user
        });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: `${userType} not found` });
        }

        res.status(200).json({ success: true, [userType.toLowerCase()]: updatedUser });
    } catch (error) {
        console.error(`Error updating ${userType}:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to delete Teacher
const deleteTeacher = async (req, res) => {
    deleteUser(req, res, teacherModel, "Teacher");
};

// API to update Teacher details
const updateTeacher = async (req, res) => {
    updateUser(req, res, teacherModel, "Teacher");
};

// API to delete Student
const deleteStudent = async (req, res) => {
    deleteUser(req, res, studentModel, "Student");
};

// API to update Student details
const updateStudent = async (req, res) => {
    updateUser(req, res, studentModel, "Student");
};

// API to delete Employee
const deleteEmployee = async (req, res) => {
    deleteUser(req, res, employeeModel, "Employee");
};

// API to update Employee details
const updateEmployee = async (req, res) => {
    updateUser(req, res, employeeModel, "Employee");
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
            select: 'firstName lastName middleName studentNumber' // Select the fields you want
        });

        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAttendanceRecords = async (req, res) => {
    try {
        const { date, userType } = req.query;

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required" });
        }

        const isoDate = new Date(date);
        const startOfDay = new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate());
        const endOfDay = new Date(isoDate.getFullYear(), isoDate.getMonth(), isoDate.getDate() + 1);

        let query = {
            timestamp: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        };

        if (userType) {
            query['userType'] = userType;
        }

        const attendanceRecords = await attendanceModel.find(query).populate('user');

        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to add class schedule to a teacher
const addTeacherClassSchedule = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { classSchedule } = req.body;

        const teacher = await teacherModel.findByIdAndUpdate(
            teacherId,
            { $push: { classSchedule: classSchedule } }, // Use $push to add to the array
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.status(200).json({ success: true, message: 'Class schedule added successfully', teacher });
    } catch (error) {
        console.error('Error adding class schedule:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to remove class schedule from a teacher
const removeTeacherClassSchedule = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { classSchedule } = req.body; // Assuming you pass the classSchedule to remove in the body

        const teacher = await teacherModel.findByIdAndUpdate(
            teacherId,
            { $pull: { classSchedule: classSchedule } }, // Use $pull to remove from the array
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.status(200).json({ success: true, message: 'Class schedule removed successfully', teacher });
    } catch (error) {
        console.error('Error removing class schedule:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to edit class schedule for a teacher
const editTeacherClassSchedule = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { oldClassSchedule, newClassSchedule } = req.body;

        const teacher = await teacherModel.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        // Find the index of the old class schedule
        const index = teacher.classSchedule.indexOf(oldClassSchedule);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Old class schedule not found' });
        }

        // Replace the old class schedule with the new one
        teacher.classSchedule[index] = newClassSchedule;

        // Save the updated teacher
        const updatedTeacher = await teacher.save();

        res.status(200).json({ success: true, message: 'Class schedule updated successfully', teacher: updatedTeacher });
    } catch (error) {
        console.error('Error editing class schedule:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to add education level to a teacher
const addTeacherEducationLevel = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { educationLevel } = req.body;

        const teacher = await teacherModel.findByIdAndUpdate(
            teacherId,
            { $push: { educationLevel: educationLevel } }, // Use $push to add to the array
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.status(200).json({ success: true, message: 'Education level added successfully', teacher });
    } catch (error) {
        console.error('Error adding education level:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to remove education level from a teacher
const removeTeacherEducationLevel = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { educationLevel } = req.body; // Assuming you pass the educationLevel to remove in the body

        const teacher = await teacherModel.findByIdAndUpdate(
            teacherId,
            { $pull: { educationLevel: educationLevel } }, // Use $pull to remove from the array
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.status(200).json({ success: true, message: 'Education level removed successfully', teacher });
    } catch (error) {
        console.error('Error removing education level:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to edit education level for a teacher
const editTeacherEducationLevel = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { oldEducationLevel, newEducationLevel } = req.body;

        const teacher = await teacherModel.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        // Find the index of the old education level
        const index = teacher.educationLevel.indexOf(oldEducationLevel);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Old education level not found' });
        }

        // Replace the old education level with the new one
        teacher.educationLevel[index] = newEducationLevel;

        // Save the updated teacher
        const updatedTeacher = await teacher.save();

        res.status(200).json({ success: true, message: 'Education level updated successfully', teacher: updatedTeacher });
    } catch (error) {
        console.error('Error editing education level:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to add grade year level to a teacher
const addTeacherGradeYearLevel = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { gradeYearLevel } = req.body;

        const teacher = await teacherModel.findByIdAndUpdate(
            teacherId,
            { $push: { gradeYearLevel: gradeYearLevel } }, // Use $push to add to the array
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.status(200).json({ success: true, message: 'Grade year level added successfully', teacher });
    } catch (error) {
        console.error('Error adding grade year level:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to remove grade year level from a teacher
const removeTeacherGradeYearLevel = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { gradeYearLevel } = req.body; // Assuming you pass the gradeYearLevel to remove in the body

        const teacher = await teacherModel.findByIdAndUpdate(
            teacherId,
            { $pull: { gradeYearLevel: gradeYearLevel } }, // Use $pull to remove from the array
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.status(200).json({ success: true, message: 'Grade year level removed successfully', teacher });
    } catch (error) {
        console.error('Error removing grade year level:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to edit grade year level for a teacher
const editTeacherGradeYearLevel = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { oldGradeYearLevel, newGradeYearLevel } = req.body;

        const teacher = await teacherModel.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        // Find the index of the old grade year level
        const index = teacher.gradeYearLevel.indexOf(oldGradeYearLevel);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Old grade year level not found' });
        }

        // Replace the old grade year level with the new one
        teacher.gradeYearLevel[index] = newGradeYearLevel;

        // Save the updated teacher
        const updatedTeacher = await teacher.save();

        res.status(200).json({ success: true, message: 'Grade year level updated successfully', teacher: updatedTeacher });
    } catch (error) {
        console.error('Error editing grade year level:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to add section to a teacher
const addTeacherSection = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { section } = req.body;

        const teacher = await teacherModel.findByIdAndUpdate(
            teacherId,
            { $push: { section: section } }, // Use $push to add to the array
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.status(200).json({ success: true, message: 'Section added successfully', teacher });
    } catch (error) {
        console.error('Error adding section:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to remove section from a teacher
const removeTeacherSection = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { section } = req.body; // Assuming you pass the section to remove in the body

        const teacher = await teacherModel.findByIdAndUpdate(
            teacherId,
            { $pull: { section: section } }, // Use $pull to remove from the array
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.status(200).json({ success: true, message: 'Section removed successfully', teacher });
    } catch (error) {
        console.error('Error removing section:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to add subjects to a teacher
const addTeacherSubjects = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { subjects } = req.body;

        const teacher = await teacherModel.findByIdAndUpdate(
            teacherId,
            { $push: { subjects: subjects } },
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.status(200).json({ success: true, message: 'Subjects added successfully', teacher });
    } catch (error) {
        console.error('Error adding subjects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to remove subjects from a teacher
const removeTeacherSubjects = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { subjects } = req.body;

        const teacher = await teacherModel.findByIdAndUpdate(
            teacherId,
            { $pull: { subjects: subjects } },
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.status(200).json({ success: true, message: 'Subjects removed successfully', teacher });
    } catch (error) {
        console.error('Error removing subjects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to edit subjects for a teacher
const editTeacherSubjects = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { oldSubjects, newSubjects } = req.body;

        const teacher = await teacherModel.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        // Find the index of the old subjects
        const index = teacher.subjects.indexOf(oldSubjects);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Old subjects not found' });
        }

        // Replace the old subjects with the new one
        teacher.subjects[index] = newSubjects;

        // Save the updated teacher
        const updatedTeacher = await teacher.save();

        res.status(200).json({ success: true, message: 'Subjects updated successfully', teacher: updatedTeacher });
    } catch (error) {
        console.error('Error editing subjects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    addEmployee, addStudent,
    addTeacher, // Add addEmployee
    addTeacherClassSchedule,
    addTeacherEducationLevel,
    addTeacherGradeYearLevel,
    addTeacherSection,
    addTeacherSubjects,
    adminDashboard,
    adminSignIn,
    adminSignOut, allEmployees, allStudents,
    allTeachers, deleteEmployee, // Add allEmployees
    deleteStudent,
    deleteTeacher, // Add deleteEmployee
    editTeacherClassSchedule,
    editTeacherEducationLevel,
    editTeacherGradeYearLevel,
    editTeacherSubjects,
    getAttendanceByDate,
    getAttendanceRecords,
    getStudentByCode,
    getUserByCode,
    loginAdmin,
    removeTeacherClassSchedule,
    removeTeacherEducationLevel,
    removeTeacherGradeYearLevel,
    removeTeacherSection,
    removeTeacherSubjects, updateEmployee, updateStudent,
    updateTeacher
};

