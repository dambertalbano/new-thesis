import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import validator from "validator";
import Attendance from "../models/attendanceModel.js";
import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '4h' });
            return res.status(200).json({ success: true, token });
        }

        res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const findUserByCode = async (code) => {
    let user = await studentModel.findOne({ code });
    if (!user) user = await teacherModel.findOne({ code });
    return user;
};

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
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.signInTime = Date.now();
        await user.save();

        const attendanceRecord = new Attendance({
            user: user._id,
            userType: userType,
            eventType: "sign-in",
        });
        await attendanceRecord.save();

        res.status(200).json({ success: true, message: "Sign in successful" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.signOutTime = Date.now();
        await user.save();

        const attendanceRecord = new Attendance({
            user: user._id,
            userType: userType,
            eventType: "sign-out",
        });
        await attendanceRecord.save();

        res.status(200).json({ success: true, message: "Sign out successful" });
    } catch (error) {
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
        if (error.name === 'ValidationError') {
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
        if (error.name === 'ValidationError') {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ success: false, message: 'Validation error', errors });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllUsers = async (req, res, Model, userType) => {
    try {
        const users = await Model.find({}).select('-password');
        res.status(200).json({ success: true, [userType]: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const allStudents = async (req, res) => {
    getAllUsers(req, res, studentModel, 'students');
};

const allTeachers = async (req, res) => {
    getAllUsers(req, res, teacherModel, 'teachers');
};

const getStudentByCode = async (req, res) => {
    try {
        const { code } = req.params;

        const student = await studentModel.findOne({ code }).select('-password');

        if (student) {
            res.status(200).json({ success: true, student });
        } else {
            res.status(404).json({ success: false, message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const adminDashboard = async (req, res) => {
    try {
        const students = await studentModel.countDocuments({});
        const teachers = await teacherModel.countDocuments({});

        const dashData = {
            students,
            teachers,
        };

        res.status(200).json({ success: true, dashData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserByCode = async (req, res) => {
    const { code } = req.params;

    try {
        let user = await studentModel.findOne({ code });
        if (!user) user = await teacherModel.findOne({ code });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const today = new Date();
        const signInDate = user.signInTime ? new Date(user.signInTime) : null;

        if (signInDate && (today.getFullYear() !== signInDate.getFullYear() ||
            today.getMonth() !== signInDate.getMonth() ||
            today.getDate() !== signInDate.getDate())) {
            user.signInTime = null;
            user.signOutTime = null;
            await user.save();
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching user" });
    }
};

const deleteUser = async (req, res, model, userType) => {
    try {
        const userId = req.params.id;
        const deletedUser = await model.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: `${userType} not found` });
        }

        res.status(200).json({ success: true, message: `${userType} deleted successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTeacher = async (req, res) => {
    deleteUser(req, res, teacherModel, "Teacher");
};

const deleteStudent = async (req, res) => {
    deleteUser(req, res, studentModel, "Student");
};

export {
    addStudent,
    addTeacher,
    adminDashboard,
    adminSignIn,
    adminSignOut,
    allStudents,
    allTeachers,
    deleteStudent,
    deleteTeacher,
    getStudentByCode,
    getUserByCode,
    loginAdmin
};
