import bcrypt from "bcrypt";
import { validationResult } from 'express-validator';
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import { default as Attendance, default as attendanceModel } from "../models/attendanceModel.js";
import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";

const excludedFields = ['-password', '-email'];

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

        const token = jwt.sign({ id: user._id, role: 'teacher' }, process.env.JWT_SECRET);

        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const logoutTeacher = async (req, res) => {
    try {
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const teacherList = async (req, res) => {
    try {
        const teachers = await teacherModel.find({}).select(excludedFields);
        res.json({ success: true, teachers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const teacherProfile = async (req, res) => {
    try {
        const teacherId = req.teacher.id;

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({ success: false, message: 'Invalid teacher ID' });
        }

        const profileData = await teacherModel.findById(teacherId).select('-password').lean();

        if (!profileData) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.json({ success: true, profileData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTeacherProfile = async (req, res) => {
    try {
        const { id } = req.teacher;
        const updates = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array() });
        }

        if (updates.image === undefined) {
            delete updates.image;
        }

        const updatedTeacher = await teacherModel.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!updatedTeacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', teacher: updatedTeacher });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStudentsByTeacher = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
            return res.status(400).json({ success: false, message: "Invalid assignment ID" });
        }

        const assignment = await teacherModel.findOne({
            "teachingAssignments._id": assignmentId,
        });

        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        const { educationLevel, gradeYearLevel, section } = assignment.teachingAssignments.find(
            (ta) => ta._id.toString() === assignmentId
        );

        const students = await studentModel.find({
            educationLevel,
            gradeYearLevel,
            section,
        });

        if (req.query.startDate && req.query.endDate) {
            const start = new Date(req.query.startDate);
            const end = new Date(req.query.endDate);

            const attendanceRecords = await attendanceModel.find({
                user: { $in: students.map((student) => student._id) },
                timestamp: { $gte: start, $lte: end },
            });

            const studentsWithAttendance = students.map((student) => {
                const attendance = attendanceRecords.filter(
                    (record) => record.user.toString() === student._id.toString()
                );
                return { ...student.toObject(), attendance };
            });

            return res.json({ success: true, students: studentsWithAttendance });
        }

        return res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAttendanceByDate = async (req, res) => {
    try {
        const date = new Date(req.query.date);

        if (isNaN(date.getTime())) {
            return res.status(400).json({ message: 'Invalid date format. Please use ISO format.' });
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
            select: 'firstName lastName middleName studentNumber position'
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

        const isoDate = new Date(date);

        if (isNaN(isoDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format. Please use ISO format." });
        }

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
            select: 'firstName lastName middleName studentNumber position'
        });

        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAttendance = async (req, res) => {
    const { startDate, endDate, userType } = req.query;

    try {
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        const attendanceRecords = await Attendance.find({
            userType,
            timestamp: { $gte: startOfDay, $lte: endOfDay },
        });

        res.status(200).json({
            success: true,
            attendance: attendanceRecords,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch attendance records.",
        });
    }
};

export {
    getAttendance,
    getAttendanceByDate,
    getAttendanceRecords,
    getStudentsByTeacher,
    loginTeacher,
    logoutTeacher,
    teacherList,
    teacherProfile,
    updateTeacherProfile
};
