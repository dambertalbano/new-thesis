import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: { type: String, required: true, select: false },
    image: { type: String, trim: true },
    number: { type: String, required: true, trim: true, maxlength: 11 },
    address: { type: String, required: true, trim: true },
    position: { type: String, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    signInTime: { type: Date },
    signOutTime: { type: Date },
},
    { timestamps: true }
);

const employeeModel = mongoose.models.employee || mongoose.model("Employee", employeeSchema);
export default employeeModel;