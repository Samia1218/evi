import mongoose from 'mongoose';
const { Schema } = mongoose;

const footerSchema = new Schema({
    heading: {
        type: String,
        required: true
    },
    subLink: [{
        title:{
            type: String
        },
        link:{
            type: String
        }
    }]
}, { timestamps: true });

export const Footer = mongoose.model('Footer', footerSchema);