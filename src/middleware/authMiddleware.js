import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const authUser = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });
            return res.status(401).json({
                success: false,
                message: "Please login",
                error: "Token not found"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { id, fullName } = decoded;

        // Optional: check if user still exists
        const userExists = await User.exists({ _id: id });
        if (!userExists) {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Attach info from JWT to request
        req.userId = id;
        req.userName = fullName;

        next();
    } catch (error) {
        console.log("Error in auth middleware", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
