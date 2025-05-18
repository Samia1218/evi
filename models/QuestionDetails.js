import mongoose from 'mongoose'
import { countryList } from '../config/countryData.js';
const {Schema} = mongoose;

export const QuestionDetailsSchema = new Schema({
    been_arrested:{
        answer:{
            type: Boolean,
            default: false,
            required: true
        },
        reason:{
            type: String,
            minlength: 10,
        }
    },
    been_deported:{
        answer:{
            type: Boolean,
            default: false,
            required: true
        },
        reason:{
            type: String,
            minlength: 10,
        }
    },
    serious_crimes:{
        answer:{
            type: Boolean,
            default: false,
            required: true
        },
        details:{
            type: String,
            minlength: 10,
        }
    },
    serious_crimes_terrorism:{
        answer:{
            type: Boolean,
            default: false,
            required: true,
        },
        details:{
            type: String,
            minlength: 10,
        }
    },
    terrorism_views:{
        answer:{
            type: Boolean,
            default: false,
            required: true,
        },
        details:{
            type: String,
            minlength: 10,
        }
    },
    sought_asylum:{
        answer:{
            type: Boolean,
            default: false,
        },
        country:{
            type: String,
            enum: countryList
        }
    }
});