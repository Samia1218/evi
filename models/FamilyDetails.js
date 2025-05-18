import mongoose from "mongoose";
import { countryList } from "../config/countryData.js";
const {Schema} = mongoose;

export const familyDetailsSchema = new Schema({
    fatherDetails:{
        name:{
            type: String,
            required: true,
        },
        nationality:{
            enum: countryList,
            type: String,
            required: true,
        },
        placeOfBirth:{
            type: String,
            required: true,
        },
        countryOfBirth:{
            enum: countryList,
            type: String,
            required: true,
        },
    },
    motherDetails:{
        name:{
            type: String,
            required: true,
        },
        nationality:{
            enum: countryList,
            type: String,
            required: true,
        },
        placeOfBirth:{
            type: String,
            required: true,
        },
        countryOfBirth:{
            enum: countryList,
            type: String,
            required: true,
        },
    },
    maritalStatus:{
        enum:["single","married","divorced","widowed"],
        type: String,
        required: true,
    },
    spouse_parents_pakistan:{
        type:Boolean,
        required: true
    },
    spouse_parents_pakistan_details:{
        type: String,
    }
});