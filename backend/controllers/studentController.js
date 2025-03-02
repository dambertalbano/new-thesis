import studentModel from "../models/studentModel.js";

const studentList = async (req, res) => {
    try {

        const students = await studentModel.find({}).select(['-password', '-email'])
        res.json({ success: true, students })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get student profile for  Student Panel
const studentProfile = async (req, res) => {
    try {

        const { docId } = req.body
        const profileData = await studentModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateStudentProfile = async (req, res) => {
    try {

        const { docId, fees, address, available } = req.body

        await studentModel.findByIdAndUpdate(docId, { fees, address, available })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export {
    studentList, studentProfile, updateStudentProfile
};

