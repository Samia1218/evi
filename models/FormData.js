import mongoose from 'mongoose';
const { Schema } = mongoose;

const formDataSchema = new Schema({
    application_id:{
        type: String,
    },
    currentTab:{
        enum:[1,2,3,4,5],
        type: Number,
        default:1
    },
    tabOne:{
         type: Object 
    },
    tabTwo:{
        type: Object,
    },
    tabThree:{
        type: Object
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
    },
    orderId:{
        type:String
    },
    downloadPdfUrl:{
        type:String
    }
});

export const FormData = mongoose.model('FormData', formDataSchema);