import express from 'express';
import { getStudentByRFID, getTeacherByRFID, getAdministratorByRFID, getUtilityByRFID } from '../controllers/userController.js';

const userRouter = express.Router();

// New routes for fetching users by RFID code
userRouter.get("/students/:code", getStudentByRFID);
userRouter.get("/teachers/:code", getTeacherByRFID);
userRouter.get("/administrators/:code", getAdministratorByRFID);
userRouter.get("/utilities/:code", getUtilityByRFID);

export default userRouter;