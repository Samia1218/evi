import mongoose from 'mongoose';
const { Schema } = mongoose;

const orderSchema = new Schema({
    transactionAmount: {
        type: Number,
        required: true
    },
    transactionType: {
        type: String,
        required: true
    },
    transactionStatus: {
        type: Boolean,
        defaultsTo: false
    },
    gatewayName: {
        type: String
    },
    transactionBy: {
        type: String
    },
    transactionDate: {
        type: Date
    },
    approverUrl:{
        type:String
    },
    rejectionObject:{
        type:Object
    },
    approvedObject:{
        type:Object
    },
    transactionId:{
        type:String
    },
    razorpayId:{
        type:String
    }
},{timestamps:true});

export const Order = mongoose.model('Order', orderSchema);