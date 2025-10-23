import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    let { userName, fullName, email, password, DOB, location, interests } = req.body;

    // Validate required fields
    if (!userName || !fullName || !email || !password || !DOB) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    userName = userName.toLowerCase();
    email = email.toLowerCase();

    // Check for existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check for existing username
    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Prepare user data
    const userData = {
      userName,
      fullName,
      email,
      password,
      DOB,
    };

    // Only include location if provided
    if (location) {
      userData.location = location;
    }

    // Only include interests if provided
    if (interests && Array.isArray(interests)) {
      userData.interests = interests.map(interest => interest.toLowerCase().trim()).filter(Boolean);
    }

    const user = await User.create(userData);

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong while creating the user. Please try again",
      });
    }

    // Exclude password from response
    const { password: _, ...newUser } = user.toObject();

    res.status(201).json({
      success: true,
      message: "User is created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error in auth controller:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



export const loginUser = async (req, res) => {
  try {
    let { email, password, location } = req.body; // location is optional

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Update location if provided and valid
    if (
      location &&
      location.type === "Point" &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2
    ) {
      await User.findByIdAndUpdate(user._id, { location });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, fullName: user.fullName },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Exclude password from response
    const { password: _, ...newUser } = user.toObject();

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error in auth controller:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



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

// Logout: clear auth cookie
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error("Error in logout:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};