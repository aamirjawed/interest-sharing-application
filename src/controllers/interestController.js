import { User } from "../models/userModel.js";
import {Interest} from '../models/interestModel.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { response } from "express";

export const interest  = async (req, res) => {
   try {
    const userId = req.userId

    const {title, description} = req.body

    if(!title){
        return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
    }

    let imageUrl;

    if(req.file){
        const result = await uploadOnCloudinary(req.file.path)
        if(result) imageUrl = result.secure_url
    }

    const newInterest = await Interest.create({
        userId,
        title,
        description,
        image: imageUrl
    })

    res.status(201).json({
           success: true,
           interest: newInterest
       });

   } catch (error) {
    console.log("Error in interest controller", error.message)
    res.status(500).json({
        success:false,
        message:"Internal Server error"
    })
   }
}


