import utilityModel from "../models/utilityModel.js";


// API to get all utilitys list for Frontend
const utilityList = async (req, res) => {
    try {

        const utilitys = await utilityModel.find({}).select(['-password', '-email'])
        res.json({ success: true, utilitys })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get utility profile for  Utility Panel
const utilityProfile = async (req, res) => {
    try {

        const { docId } = req.body
        const profileData = await utilityModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update utility profile data from  Utility Panel
const updateUtilityProfile = async (req, res) => {
    try {

        const { docId, fees, address, available } = req.body

        await utilityModel.findByIdAndUpdate(docId, { fees, address, available })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export { updateUtilityProfile, utilityList, utilityProfile };

