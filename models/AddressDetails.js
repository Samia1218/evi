import mongoose from "mongoose";
import { countryList } from "../config/countryData.js";
const {Schema} = mongoose;

export const addressDetailsSchema = new Schema({
    house_number_or_street:{
        type: String,
        required: true,
        maxLength:35,
    },
    city:{
        type: String,
        required: true,
        maxLength:35,
    },
    country:{
        type: String,
        enum: countryList,
    },
    state:{
        type: String,
        maxLength:35,
    },
    postal_code:{
        type: String,
        maxLength:35,
    },
    telephone_number:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        match: [/.+@.+\..+/, "Please enter a valid e-mail address"],
    },
});