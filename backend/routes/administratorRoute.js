import express from 'express';
import { administratorList, administratorProfile, updateAdministratorProfile } from '../controllers/administratorController.js';
import authAdministrator from '../middleware/authAdministrator.js';
const administratorRouter = express.Router();

administratorRouter.get("/list", administratorList)
administratorRouter.get("/profile", authAdministrator, administratorProfile)
administratorRouter.put("/update-profile", authAdministrator, updateAdministratorProfile)

export default administratorRouter;