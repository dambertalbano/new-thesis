import administratorModel from "../models/administratorModel.js";

// API to get all administrators list for Frontend
const administratorList = async (req, res) => {
    try {

        const administrators = await administratorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, administrators })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to get administrator profile for  Administrator Panel
const administratorProfile = async (req, res) => {
    try {

        const { docId } = req.body
        const profileData = await administratorModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update administrator profile data from  Administrator Panel
const updateAdministratorProfile = async (req, res) => {
    try {

        const { docId, fees, address, available } = req.body

        await administratorModel.findByIdAndUpdate(docId, { fees, address, available })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



export { administratorList, administratorProfile, updateAdministratorProfile };

