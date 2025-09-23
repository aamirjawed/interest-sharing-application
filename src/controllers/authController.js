import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {

    try {
        let { userName, fullName, email, password, DOB, location } = req.body;

        if (!userName || !fullName || !email || !password || !DOB) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        userName = userName.toLowerCase();
        email = email.toLowerCase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        const existingUserName = await User.findOne({ userName });
        if (existingUserName) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        const user = await User.create({
            userName,
            fullName,
            email,
            password,
            DOB,
            location
        });

        if (!user) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong while creating the user. Please try again"
            });
        }

        const { password: _, ...newUser } = user.toObject(); // exclude password

        res.status(201).json({
            success: true,
            message: "User is created successfully",
            user: newUser
        });

    } catch (error) {
        console.error("Error in auth controller", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};


export const loginUser = async (req, res) => {

    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        email = email.toLowerCase();
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }
        const token = await jwt.sign({ id: user._id, fullName: user.fullName }, process.env.JWT_SECRET);
        const { password: _, ...newUser } = user.toObject(); // exclude password

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: newUser
        });
    } catch (error) {
        console.error("Error in auth controller", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
}

export const CurrentUser = async (req, res) => {
    try {
        const userId = req.userId;

        // Find user and exclude password
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Current user",
            user
        });
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ message: "Server error" });
    }
};


export const updateUserLocation = async (req, res) => {
    try {
        const userId = req.userId; // from auth middleware
        const { lng, lat } = req.body;

        if (lng === undefined || lat === undefined) {
            return res.status(400).json({
                success: false,
                message: "Both lng and lat are required"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Location updated successfully",
            location: updatedUser.location
        });

    } catch (error) {
        console.error("Error updating location:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
