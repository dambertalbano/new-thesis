import express from 'express';
import { employeeList, employeeProfile, getEmployeeAttendance, loginEmployee, updateEmployeeProfile } from '../controllers/employeeController.js';
import authEmployee from '../middleware/authEmployee.js';

const employeeRouter = express.Router();

employeeRouter.post("/login", loginEmployee);
employeeRouter.get("/profile", authEmployee, employeeProfile);
employeeRouter.put("/update-profile", authEmployee, updateEmployeeProfile); // Use PUT method
employeeRouter.get("/list", authEmployee, employeeList);
employeeRouter.get("/attendance", authEmployee, getEmployeeAttendance);

export default employeeRouter;