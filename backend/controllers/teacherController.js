import bcrypt from "bcrypt";
import { validationResult } from 'express-validator';
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import cloudinary from "../config/cloudinary.js";
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
        const teacherId = req.teacher.id;
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
    const { assignmentId } = req.params; // Extract assignmentId from the request parameters
    console.log("Received Assignment ID:", assignmentId);

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: "Invalid assignment ID" });
    }

    const assignment = await teacherModel.findOne({
      "teachingAssignments._id": assignmentId,
    });

    if (!assignment) {
      console.log("Assignment not found for ID:", assignmentId);
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
    console.error("Error in getStudentsByTeacher:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (req.teacher.role !== 'admin' && req.teacher.id !== id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array() });
        }

        const teacher = await teacherModel.findById(id);

        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
            teacher.image = imageUpload.secure_url;
        }

        teacher.firstName = updates.firstName || teacher.firstName;
        teacher.middleName = updates.middleName || teacher.middleName;
        teacher.lastName = updates.lastName || teacher.lastName;
        teacher.email = updates.email || teacher.email;
        teacher.number = updates.number || teacher.number;
        teacher.address = updates.address || teacher.address;
        teacher.code = updates.code || teacher.code;

        await teacher.save();

        res.status(200).json({ success: true, message: 'Teacher profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTeacherTeachingAssignments = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { teachingAssignments } = req.body;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const updatedAssignments = teachingAssignments.map(assignment => ({
            ...assignment,
            _id: assignment._id || new mongoose.Types.ObjectId()
        }));

        teacher.teachingAssignments = updatedAssignments;

        teacher.markModified('teachingAssignments');

        await teacher.save();

        res.status(200).json({ success: true, message: 'Teaching assignments updated successfully', teachingAssignments: teacher.teachingAssignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addTeacherClassSchedule = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { classSchedule } = req.body;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.classSchedule.push(classSchedule);
        await teacher.save();

        res.status(200).json({ success: true, message: 'Class schedule added successfully', classSchedule: teacher.classSchedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeTeacherClassSchedule = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { classScheduleId } = req.params;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.classSchedule = teacher.classSchedule.filter(schedule => schedule._id.toString() !== classScheduleId);
        await teacher.save();

        res.status(200).json({ success: true, message: 'Class schedule removed successfully', classSchedule: teacher.classSchedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const editTeacherClassSchedule = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { classScheduleId } = req.params;
        const { updatedClassSchedule } = req.body;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const classScheduleIndex = teacher.classSchedule.findIndex(schedule => schedule._id.toString() === classScheduleId);
        if (classScheduleIndex === -1) {
            return res.status(404).json({ success: false, message: 'Class schedule not found' });
        }

        teacher.classSchedule[classScheduleIndex] = updatedClassSchedule;
        await teacher.save();

        res.status(200).json({ success: true, message: 'Class schedule updated successfully', classSchedule: teacher.classSchedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addTeacherEducationLevel = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { educationLevel } = req.body;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.educationLevel.push(educationLevel);
        await teacher.save();

        res.status(200).json({ success: true, message: 'Education level added successfully', educationLevel: teacher.educationLevel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeTeacherEducationLevel = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { educationLevelId } = req.params;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.educationLevel = teacher.educationLevel.filter(level => level._id.toString() !== educationLevelId);
        await teacher.save();

        res.status(200).json({ success: true, message: 'Education level removed successfully', educationLevel: teacher.educationLevel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const editTeacherEducationLevel = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { educationLevelId } = req.params;
        const { updatedEducationLevel } = req.body;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const educationLevelIndex = teacher.educationLevel.findIndex(level => level._id.toString() === educationLevelId);
        if (educationLevelIndex === -1) {
            return res.status(404).json({ success: false, message: 'Education level not found' });
        }

        teacher.educationLevel[educationLevelIndex] = updatedEducationLevel;
        await teacher.save();

        res.status(200).json({ success: true, message: 'Education level updated successfully', educationLevel: teacher.educationLevel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addTeacherGradeYearLevel = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { gradeYearLevel } = req.body;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.gradeYearLevel.push(gradeYearLevel);
        await teacher.save();

        res.status(200).json({ success: true, message: 'Grade/year level added successfully', gradeYearLevel: teacher.gradeYearLevel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeTeacherGradeYearLevel = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { gradeYearLevelId } = req.params;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.gradeYearLevel = teacher.gradeYearLevel.filter(level => level._id.toString() !== gradeYearLevelId);
        await teacher.save();

        res.status(200).json({ success: true, message: 'Grade/year level removed successfully', gradeYearLevel: teacher.gradeYearLevel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const editTeacherGradeYearLevel = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { gradeYearLevelId } = req.params;
        const { updatedGradeYearLevel } = req.body;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const gradeYearLevelIndex = teacher.gradeYearLevel.findIndex(level => level._id.toString() === gradeYearLevelId);
        if (gradeYearLevelIndex === -1) {
            return res.status(404).json({ success: false, message: 'Grade/year level not found' });
        }

        teacher.gradeYearLevel[gradeYearLevelIndex] = updatedGradeYearLevel;
        await teacher.save();

        res.status(200).json({ success: true, message: 'Grade/year level updated successfully', gradeYearLevel: teacher.gradeYearLevel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addTeacherSection = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { section } = req.body;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.section.push(section);
        await teacher.save();

        res.status(200).json({ success: true, message: 'Section added successfully', section: teacher.section });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeTeacherSection = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { sectionId } = req.params;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.section = teacher.section.filter(s => s._id.toString() !== sectionId);
        await teacher.save();

        res.status(200).json({ success: true, message: 'Section removed successfully', section: teacher.section });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addTeacherSubjects = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { subjects } = req.body;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.subjects.push(subjects);
        await teacher.save();

        res.status(200).json({ success: true, message: 'Subjects added successfully', subjects: teacher.subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeTeacherSubjects = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { subjectsId } = req.params;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        teacher.subjects = teacher.subjects.filter(s => s._id.toString() !== subjectsId);
        await teacher.save();

        res.status(200).json({ success: true, message: 'Subjects removed successfully', subjects: teacher.subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const editTeacherSubjects = async (req, res) => {
    try {
        const { id } = req.teacher;
        const { subjectsId } = req.params;
        const { updatedSubjects } = req.body;

        const teacher = await teacherModel.findById(id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const subjectsIndex = teacher.subjects.findIndex(s => s._id.toString() === subjectsId);
        if (subjectsIndex === -1) {
            return res.status(404).json({ success: false, message: 'Subjects not found' });
        }

        teacher.subjects[subjectsIndex] = updatedSubjects;
        await teacher.save();

        res.status(200).json({ success: true, message: 'Subjects updated successfully', subjects: teacher.subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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

        console.log("Attendance Records:", attendanceRecords);

        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAttendance = async (req, res) => {
  const { startDate, endDate, userType } = req.query;

  try {
    // Normalize startDate to the beginning of the day
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Normalize endDate to the end of the day
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log("Querying attendance records from:", startOfDay, "to:", endOfDay);

    const attendanceRecords = await Attendance.find({
      userType,
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    res.status(200).json({
      success: true,
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records.",
    });
  }
};

export {
    addTeacherClassSchedule, addTeacherEducationLevel, addTeacherGradeYearLevel, addTeacherSection, addTeacherSubjects, editTeacherClassSchedule, editTeacherEducationLevel, editTeacherGradeYearLevel, editTeacherSubjects, getAttendance, getAttendanceByDate,
    getAttendanceRecords, getStudentsByTeacher, loginTeacher, logoutTeacher, removeTeacherClassSchedule, removeTeacherEducationLevel, removeTeacherGradeYearLevel, removeTeacherSection, removeTeacherSubjects, teacherList, teacherProfile, updateTeacher, updateTeacherProfile, updateTeacherTeachingAssignments
};

