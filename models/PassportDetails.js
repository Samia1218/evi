import mongoose from "mongoose";
import { countryList } from "../config/countryData.js";
const {Schema} = mongoose;

export const passportDetailsSchema = new Schema({
    passport_type:{
        enum:["Ordinary passport","Diplomatic passport","Official passport","Service passport","Special passport"],
        type: String,
        default:"Ordinary passport",
    },
    passport_number: {
        type: String,
        required: true,
        trim: true
    },
    date_of_issue: {
        type: Date,
        required: true,
        trim: true
    },
    date_of_expiry: {
        type: Date,
        required: true,
        trim: true
    },
    country_of_issue: {
        enum: countryList,
        type: String,
        required: true,
    },
    otherPasports:{
        type:Boolean,
        default:false
    },
    otherPassportDetails:[{
        country_of_issue: {
            enum: countryList,
            type: String,
        },
        passport_number: {
            type: String,
            trim: true
        },
        date_of_issue:{
            type: Date,
            trim: true
        },
        place_of_issue:{
            type: String,
            trim: true
        },
        nationality_in_other_passport:{
            enum: countryList,
            type: String,
        },
    }]
});