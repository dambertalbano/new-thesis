import express from 'express';
import { employeeProfile, getEmployeesByEmployee, loginEmployee, updateEmployeeProfile } from '../controllers/employeeController.js';
import authEmployee from '../middleware/authEmployee.js';

const employeeRouter = express.Router();

employeeRouter.post("/login", loginEmployee);
employeeRouter.get("/profile", authEmployee, employeeProfile);
employeeRouter.put("/update-profile", authEmployee, updateEmployeeProfile); // Use PUT method
employeeRouter.get("/employees-by-employee/:employeeId", authEmployee, getEmployeesByEmployee);

export default employeeRouter;