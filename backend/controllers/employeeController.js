import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import attendanceModel from "../models/attendanceModel.js";
import employeeModel from "../models/employeeModel.js";

const handleControllerError = (res, error, message = 'An error occurred') => {
    console.error(error);
    res.status(500).json({ success: false, message: message, error: error.message });
};

const loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        const user = await employeeModel.findOne({ email }).select('+password').lean();

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: 'employee' }, process.env.JWT_SECRET);

        res.json({ success: true, token });
    } catch (error) {
        handleControllerError(res, error, "Login error");
    }
};

const employeeList = async (req, res) => {
    try {
        const employees = await employeeModel.find({}).select(['-password', '-email']).lean();
        res.json({ success: true, employees });
    } catch (error) {
        handleControllerError(res, error, "Error getting employee list");
    }
};

const employeeProfile = async (req, res) => {
    try {
        const employeeId = req.employee.id;

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ success: false, message: 'Invalid employee ID' });
        }

        const profileData = await employeeModel.findById(employeeId).select('-password').lean();

        if (!profileData) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        res.json({ success: true, profileData });
    } catch (error) {
        handleControllerError(res, error, "Error fetching employee profile");
    }
};

const updateEmployeeProfile = async (req, res) => {
    try {
        const { id } = req.employee;
        const updates = req.body;

        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const updatedEmployee = await employeeModel.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        }).select('-password').lean();

        if (!updatedEmployee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', employee: updatedEmployee });

    } catch (error) {
        handleControllerError(res, error, "Error updating employee profile");
    }
};

const getEmployeesByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ success: false, message: 'Invalid employee ID' });
        }

        const employee = await employeeModel.findById(employeeId).lean();

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const { educationLevel, gradeYearLevel, section } = employee;

        const query = {
            $or: [
                { educationLevel: { $in: educationLevel } },
                { gradeYearLevel: { $in: gradeYearLevel } },
                { section: { $in: section } }
            ]
        };

        const employees = await employeeModel.find(query).select(['-password', '-email']).lean();

        res.json({ success: true, employees });
    } catch (error) {
        handleControllerError(res, error, "Error getting employees by employee");
    }
};

const getEmployeeAttendance = async (req, res) => {
    try {
        const employeeId = req.employee.id;

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ success: false, message: 'Invalid employee ID' });
        }

        const attendance = await attendanceModel.find({
            user: employeeId,
            userType: 'Employee'
        })
            .populate('user', 'firstName middleName lastName position')
            .sort({ timestamp: 1 })
            .lean();

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'No attendance records found for this employee' });
        }

        const groupedAttendance = attendance.reduce((acc, record) => {
            const date = new Date(record.timestamp).toLocaleDateString();

            const existingRecord = acc.find(item =>
                new Date(item.date).toLocaleDateString() === date && item.user._id.toString() === record.user._id.toString()
            );

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
        handleControllerError(res, error, 'Error getting employee attendance');
    }
};

export { employeeList, employeeProfile, getEmployeeAttendance, getEmployeesByEmployee, loginEmployee, updateEmployeeProfile };
