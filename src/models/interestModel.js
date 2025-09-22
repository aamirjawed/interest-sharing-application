import mongoose from "mongoose";

const interestSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        required:true,
        index:true,
    },
    description:{
        type:String,
    },
    image:{
        type:String
    }
}, {timestamps:true})

export const Interest = mongoose.model("Interest", interestSchema)