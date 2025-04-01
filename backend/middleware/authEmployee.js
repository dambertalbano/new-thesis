import jwt from 'jsonwebtoken';
import employeeModel from '../models/employeeModel.js'; // Import employee model

const authEmployee = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Assumes 'Bearer <token>' format

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, login again' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the decoded token has the 'employee' role
        if (decoded.role !== 'employee') {
            return res.status(403).json({ success: false, message: 'Forbidden: Employee role required' });
        }

        const employee = await employeeModel.findById(decoded.id).select('-password');

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        req.employee = employee; // Attach employee object to request
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token: ' + err.message }); // Send specific error message
    }
};

export default authEmployee;