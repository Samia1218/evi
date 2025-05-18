import mongoose from 'mongoose';
import { applicantDetailsSchema } from './ApplicantDetails.js';
import { passportDetailsSchema } from './PassportDetails.js';
import { travelDetailsSchema } from './TravelDetails.js';
import { addressDetailsSchema } from './AddressDetails.js';
import { familyDetailsSchema } from './FamilyDetails.js';
import { QuestionDetailsSchema } from './QuestionDetails.js';
import { uniqueId } from '../utils/uniqueId.js';
const { Schema } = mongoose;

/* const formDataSchema = new Schema({
    visaType:{
        type: String,
        enum:["tourist","business","medical","medical attendant","conference"],
        default:"tourist",
    },
    dateOfArrival:{
        type: Date,
        required: true,
        trim: true
    },
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
    email: {
        type: String,
        required: true,
        match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        trim: true,
        // unique: true
    },
    phone: {
        type: String,
        required: true,
        match: /^[1-9]\d{9}$/
    },
    status:{
        type: String,
        enum:["pending","approved","rejected"],
        default:"pending"
    },
    gender: {
        type: String,
        enum:["Male","Female","Other"],
        default:"Male",
    },
    nationality:{
        type: String,
        required: true,
        trim: true
    },
    passport_type:{
        type: String,
        default: "Ordinary passport",
        required: true,
        trim: true
    },
    image_url:{
        type: String,
        default:''
    },
    answers:{
        type: Array,
    }
    
}, { timestamps: true }); */

//todo: uncomment required:true for subschemas
const formDataSchema = new Schema({
    _id:{
        type: String,
        // required: true,
        // trim: true
    },
    temporary_application_id:{
        type: String,
    },
    filled_application_id:{
        type: String,
    },
    applicantDetails:{
        type: applicantDetailsSchema,
        required: true,
    },
    passportDetails:{
        type: passportDetailsSchema,
        // required: true,
    },
    travelDetails:{
        type: travelDetailsSchema,
        // required: true,
    },
    addressDetails:{
        type: addressDetailsSchema,
        // required: true,
    },
    familyDetails:{
        type: familyDetailsSchema,
        // required: true,
    },
    questionDetails:{
        type: QuestionDetailsSchema,
        // required: true,
    },
    uploads:{
        status:{
            enum: ["incomplete","complete"],
            type: String,
            default:"incomplete"
        },
        uploadFile:[
            {
                fileName: {
                    type: String
                },
                fileUrl: {
                    type: String
                }
            }
        ]
    },
    status:{
        enum: ["incomplete","pending","approved","rejected"],
        type: String,
        default:"incomplete"
    },
    approved_visa_url:{
        type: String,
        default:''
    },
    paid:{
        type: Boolean,
        default: false
    }
});

// Define the virtual property 'stage' in formDataSchema
formDataSchema.virtual('stage').get(function () {
    // Access the sub-schemas using 'this' keyword
    const { applicantDetails, passportDetails, travelDetails, addressDetails, familyDetails, questionDetails } = this;

    // Check the status of each sub-schema and update the 'stage' field accordingly
    if (!applicantDetails) {
        return 'applicantDetails incomplete';
    } else if (!passportDetails) {
        return 'passportDetails incomplete';
    } else if (!travelDetails) {
        return 'travelDetails incomplete';
    } else if (!addressDetails) {
        return 'addressDetails incomplete';
    } else if (!familyDetails) {
        return 'familyDetails incomplete';
    }else if(!questionDetails){
        return 'questionDetails incomplete';
    }
     else {
        return 'completed';
    }
});

// Define a 'toJSON' option to include the virtual 'stage' field when converting the document to JSON
formDataSchema.set('toJSON', { virtuals: true });



formDataSchema.pre('save', function(next) {
    const form = this;
    if(form.isNew){
        const id = uniqueId();
        console.log(id)
        form._id = id;
        if(form.applicantDetails.email !== form.applicantDetails.confirm_email){
            next(new Error('Emails do not match'));
        } else {
            next();
        }
    }
    if(form.applicantDetails && form.passportDetails && form.travelDetails && form.addressDetails && form.familyDetails && form.questionDetails){
        form.status = "pending";
    }
    next();
});

export const FormData = mongoose.model('FormData', formDataSchema);