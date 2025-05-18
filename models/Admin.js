import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const { Schema } = mongoose;

const adminSchema = new Schema({
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password:{
        type: String,
        required: true,
        minLength: [6, "Password must be at least 6 characters long"]
    },
    userType: {
        type: String,
        enum: ["super admin","admin","writer"]
    }
}, {timestamps: true});

adminSchema.pre("save", async function(next){
    const admin = this;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password, salt);
        admin.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

adminSchema.methods.isValidPassword = async function(password){
    const admin = this;
    try {
        return await bcrypt.compare(password, admin.password);
    } catch (error) {
        throw new Error(error);
    }
}

adminSchema.methods.generateToken = async function(){
    const admin = this;
    try {
        const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return token;
    } catch (error) {
        throw new Error(error);
    }
}

export const Admin = mongoose.model("Admin", adminSchema);