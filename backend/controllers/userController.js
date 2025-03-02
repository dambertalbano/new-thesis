import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";
import administratorModel from "../models/administratorModel.js";
import utilityModel from "../models/utilityModel.js";

// API to get student by RFID code
const getStudentByRFID = async (req, res) => {
    const { code } = req.params;

    try {
        const student = await studentModel.findOne({ rfid: code });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error("Error fetching student by RFID code:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// API to get teacher by RFID code
const getTeacherByRFID = async (req, res) => {
    const { code } = req.params;

    try {
        const teacher = await teacherModel.findOne({ rfid: code });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        console.error("Error fetching teacher by RFID code:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// API to get administrator by RFID code
const getAdministratorByRFID = async (req, res) => {
    const { code } = req.params;

    try {
        const administrator = await administratorModel.findOne({ rfid: code });
        if (!administrator) {
            return res.status(404).json({ message: 'Administrator not found' });
        }
        res.json(administrator);
    } catch (error) {
        console.error("Error fetching administrator by RFID code:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// API to get utility by RFID code
const getUtilityByRFID = async (req, res) => {
    const { code } = req.params;

    try {
        const utility = await utilityModel.findOne({ rfid: code });
        if (!utility) {
            return res.status(404).json({ message: 'Utility not found' });
        }
        res.json(utility);
    } catch (error) {
        console.error("Error fetching utility by RFID code:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export {
    getStudentByRFID,
    getTeacherByRFID,
    getAdministratorByRFID,
    getUtilityByRFID,
};