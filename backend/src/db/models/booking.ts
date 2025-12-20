import mongoose from 'mongoose'

// assuming only 1:1 sessions are booked

const booking = new mongoose.Schema({
    mentor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    startTime : {
        type : Date,
        required : true
    },
    endTime : {
        type : Date,
        required : true
    },
    status : {
        type : String,
        enum : ["completed", "missed", "upcoming", "cancelled"],
        default : "upcoming"
    },
    reviewID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Review'
    },
})