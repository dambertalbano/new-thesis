import employeeModel from "../models/employeeModel.js";


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

const updateEmployeeProfile = async (req, res) => {
    try {
        const { docId, address, educationLevel, gradeYearLevel, section } = req.body;
        await employeeModel.findByIdAndUpdate(docId, { address, educationLevel, gradeYearLevel, section });
        res.json({ success: true, message: 'Profile Updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { employeeProfile, updateEmployeeProfile };

