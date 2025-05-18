import mongoose from "mongoose";
const { Schema } = mongoose;

export const travelDetailsSchema = new Schema({
    visaType: {
        enum:["tourist","business","medical","medical attendant","conference"],
        type: String,
        default:"tourist",
    },
    purpose_of_visit: {
        type: String,
        required: true,
    },
    visa_duration:{
        type: String,
        required: true,
    },
    date_of_arrival: {
        type: Date,
        required: true,
    },
    port_of_arrival: {
        type: String,
        required: true,
    },
    expected_port_of_departure: {
        type: String,
        
    },
});
