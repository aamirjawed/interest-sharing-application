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
    },
    location:{
        type:{
            type:String,
            enum:['Point'],
            required:true,
            default:'Point'
        },
        coordinates:{
            type:[Number], // longitude and latitude
            required:true

        }
    }
}, {timestamps:true})

interestSchema.index({location:'2dsphere'})

export const Interest = mongoose.model("Interest", interestSchema)