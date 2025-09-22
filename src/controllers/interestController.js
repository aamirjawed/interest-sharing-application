import { User } from "../models/userModel.js";
import { Interest } from '../models/interestModel.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { response } from "express";

export const addInterest = async (req, res) => {
    try {
        const userId = req.userId

        const { title, description } = req.body

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        let imageUrl;

        if (req.file) {
            const result = await uploadOnCloudinary(req.file.path)
            if (result) imageUrl = result.secure_url
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
            success: false,
            message: "Internal Server error"
        })
    }
}

export const getAllInterest = async (req, res) => {
    try {
        const userId = req.userId;

        const interests = await Interest.find({ userId });

        if (!interests || interests.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Nothing to show"
            })
        }


        res.status(200).json({
            success: true,
            message: "Your all interests.",
            interests
        })
    } catch (error) {
        console.log("Error in get all interest controller in interest controller", error.message)
        res.status(500).json({
            success: false,
            message: "Internal Server error"
        })
    }
}

export const editInterest = async (req, res) => {
    try {
        const { interestId } = req.params;
        const userId = req.userId;

        const updates = {};

        // Handle text fields
        if (req.body.title) updates.title = req.body.title;
        if (req.body.description) updates.description = req.body.description;

        // Handle image upload
        if (req.file) {
            const result = await uploadOnCloudinary(req.file.path);
            if (!result) {
                return res.status(500).json({
                    success: false,
                    message: "Image upload failed"
                });
            }
            updates.image = result.secure_url; // <-- save Cloudinary URL
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields to update"
            });
        }

        const interest = await Interest.findOneAndUpdate(
            { _id: interestId, userId },
            { $set: updates },
            { new: true }
        );

        if (!interest) {
            return res.status(404).json({
                success: false,
                message: "Interest not found or not authorized"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Interest updated successfully",
            interest
        });
    } catch (error) {
        console.error("Error in edit interest controller:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server error"
        });
    }
};


export const getInterestById = async(req, res) => {
    try {
        const {interestId} = req.params;

        const userId = req.userId

        const interest = await Interest.findById({_id:interestId, userId})

        if(!interest){
            return res.status(404).json({
                success:false,
                message:"Not found or unauthorized"
            })
        }

        res.status(200).json({
            success:true,
            message:"Your interest",
            interest
        })
    } catch (error) {
        console.log("Error in get interest by id in interest controller", error.message)
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const deleteInterest = async(req, res) => {
    try {
        const {interestId} = req.params
        const userId  = req.userId

        const interest = await Interest.findOneAndDelete({_id:interestId, userId});

        if(!interest){
            return res.status(404).json({
                success:false,
                message:"Not found or unauthorized"
            })
        }

        res.status(200).json({
            success:true,
            message:"Interest deleted successfully",
            interest
        })
    } catch (error) {
        console.log("Error in delete interest in interest controller", error.message)
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}


