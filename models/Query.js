import mongoose from "mongoose";
const {Schema} = mongoose;

const querySchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        trim: true,
        // unique: true
    },
    subject:{
        type: String,
        required: true,
        trim: true,
    },
    message:{
        type: String,
        required: true,
        maxLength: 500,
    },
    status:{
        enum:["pending","resolved"],
        type: String,
        default:"pending"
    },
    applied_for_visa:{
        type:Boolean,
        default:false
    },
    priority:{
        enum:["low","medium","high"],
        type: String,
        default:"low"
    }
});

export const Query = mongoose.model("Query", querySchema);