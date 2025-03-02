import express from 'express';
import { updateUtilityProfile, utilityList, utilityProfile } from '../controllers/utilityController.js';
import authUtility from '../middleware/authUtility.js';
const utilityRouter = express.Router();

utilityRouter.get("/list", utilityList)
utilityRouter.get("/profile", authUtility, utilityProfile)
utilityRouter.post("/update-profile", authUtility, updateUtilityProfile)

export default utilityRouter;