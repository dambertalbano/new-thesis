import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import employeeModel from "../models/employeeModel.js";

// API for employee Login
const loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!password) {
            return res.json({ success: false, message: "Password is required" });
        }

        const user = await employeeModel.findOne({ email }).select('+password').lean();

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

// API to get all employees list for Frontend
const employeeList = async (req, res) => {
    try {
        const employees = await employeeModel.find({}).select(['-password', '-email']);
        res.json({ success: true, employees });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get employee profile for Employee Panel
const employeeProfile = async (req, res) => {
    try {
        const { docId } = req.body;
        const profileData = await employeeModel.findById(docId).select('-password');
        res.json({ success: true, profileData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to update employee profile
const updateEmployeeProfile = async (req, res) => {
    try {
        const { id } = req.employee; // Assuming you have employee info in req.employee from authEmployee middleware
        const updates = req.body;

        const updatedEmployee = await employeeModel.findByIdAndUpdate(id, updates, {
            new: true, // Return the updated document
            runValidators: true // Ensure schema validation
        }).select('-password');

        if (!updatedEmployee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', employee: updatedEmployee });

    } catch (error) {
        console.error('Error updating employee profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get employees with the same education level, grade year level, and section as the employee
const getEmployeesByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Find the employee by ID
        const employee = await employeeModel.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        // Extract education level, grade year level, and section from the employee's profile
        const { educationLevel, gradeYearLevel, section } = employee;

        // Build the query to find matching employees
        const query = {
            $or: [
                { educationLevel: { $in: educationLevel } },
                { gradeYearLevel: { $in: gradeYearLevel } },
                { section: { $in: section } }
            ]
        };

        // Find employees matching the employee's education level, grade year level, and section
        const employees = await employeeModel.find(query).select(['-password', '-email']);

        res.json({ success: true, employees });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { employeeList, employeeProfile, getEmployeesByEmployee, loginEmployee, updateEmployeeProfile };

