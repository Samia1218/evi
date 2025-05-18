import mongoose from 'mongoose';
const { Schema } = mongoose;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    publishedDate: {
        type: Date,
        required: true
    },
    lastUpdate:{
        type:Date,
        required:true
    },
    isPublished:{
        type: Boolean,
        required:true,
        default:false
    },
    metaTitle:{
        type: String,
    },
    metaDescription:{
        type: String,
    }
}, { timestamps: true });

export const Blog = mongoose.model('Blog', blogSchema);