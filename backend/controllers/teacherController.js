import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import teacherModel from "../models/teacherModel.js";

// API for teacher Login
const loginTeacher = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await teacherModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get all teachers list for Frontend
const teacherList = async (req, res) => {
    try {

        const teachers = await teacherModel.find({}).select(['-password', '-email'])
        res.json({ success: true, teachers })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get teacher profile for  Teacher Panel
const teacherProfile = async (req, res) => {
    try {

        const { docId } = req.body
        const profileData = await teacherModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update teacher profile data from  Teacher Panel
const updateTeacherProfile = async (req, res) => {
    try {

        const { docId, fees, address, available } = req.body

        await teacherModel.findByIdAndUpdate(docId, { fees, address, available })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export { loginTeacher, teacherList, teacherProfile, updateTeacherProfile };

