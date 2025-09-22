import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
    
    try {
        let { userName, fullName, email, password, DOB } = req.body;

        if (!userName || !fullName || !email  || !password || !DOB) {
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
        const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);
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

export default registerUser;
