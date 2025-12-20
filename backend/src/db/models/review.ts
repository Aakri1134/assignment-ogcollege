import mongoose from "mongoose";

const review = new mongoose.Schema({
    heading : {
        type : String,
        required : true
    },
    comment : {
        type : String
    },
    rating : {
        type : Number,
        enum : [1, 2, 3, 4, 5]
    },
    mentorID : {
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Mentor',
        required : true
    },
    userID : {
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Mentor',
        required : true
    },
    bookingID : {
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Booking'
    }
}, {
    timestamps : true
})

const Review = mongoose.model("Review", review)
export default Review
