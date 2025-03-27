import express from 'express';
import { employeeProfile, updateEmployeeProfile } from '../controllers/employeeController.js';
import authEmployee from '../middleware/authEmployee.js';
const employeeRouter = express.Router();

employeeRouter.get("/profile", authEmployee, employeeProfile)
employeeRouter.post("/update-profile", authEmployee, updateEmployeeProfile)

export default employeeRouter;