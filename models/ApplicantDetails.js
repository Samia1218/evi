import mongoose from 'mongoose';
const { Schema } = mongoose;
import {countryList} from '../config/countryData.js';

export const applicantDetailsSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    date_of_birth: {
        type: Date,
        required: true,
        trim: true
    },
    country_of_birth: {
        enum: countryList,
        required: true,
        type: String,
    },
    city_of_birth: {
        type: String,
        required: true,
        trim: true
    },
    national_id_number: {
        type: String,
        required: true,
        trim: true
    },
    religion: {
        type: String,
        required: true,
        trim: true,
    },
    educational_qualification: {
        type: String,
        required: true,
        trim: true,
    },
    country_of_citizenship:{
        type: String,
        enum: countryList,
        required: true,
    },
    gender:{
        enum:["male","female","prefer not to say"],
        type: String,
        required: true,
    },
    visible_identification_marks:{
        type: String,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    confirm_email:{
        type: String,
        required: true,
    }
});

/* personalDetailsSchema.pre('save', function(next) {
    if (this.email !== this.confirm_email) {
        next(new Error('Emails do not match'));
    } else {
        next();
    }
}); */

// export const PersonalDetails = mongoose.model("PersonalDetails", applicantDetailsSchema);