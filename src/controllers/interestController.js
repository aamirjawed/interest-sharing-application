import { User } from "../models/userModel.js";
import { Interest } from "../models/interestModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//  Add new interest
export const addInterest = async (req, res) => {
  try {
    const userId = req.userId;
    const userName = req.userName;
    const { title, description, tags } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // fetch user's saved location
    const user = await User.findById(userId);
    if (!user || !user.location || !Array.isArray(user.location.coordinates)) {
      return res.status(400).json({
        success: false,
        message: "User location not found",
      });
    }

    const coordinates = user.location.coordinates;
    if (coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid user location format",
      });
    }

    // Upload image if provided
    let imageUrl;
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      if (result) imageUrl = result.secure_url;
    }

    // Process tags
    const processedTags = tags && Array.isArray(tags) 
      ? tags.map(tag => tag.toLowerCase().trim()).filter(Boolean)
      : [];

    // Create new interest
    const newInterest = await Interest.create({
      userId,
      title,
      description,
      tags: processedTags,
      image: imageUrl,
      location: {
        type: "Point",
        coordinates, // already [lng, lat]
      },
    });

    // Find nearby users (within radius)
    const nearbyUsers = await User.find({
      _id: { $ne: userId },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates },
          $maxDistance: 5000,
        },
      },
    }).select("_id");

    // Filter nearby users who have matching interests with post tags
    const nearbyUserIds = nearbyUsers.map(u => u._id);
    let sameInterestUsers = [];
    
    if (processedTags.length > 0) {
      // Find users whose interests match any of the post tags
      sameInterestUsers = await User.distinct("_id", {
        _id: { $in: nearbyUserIds },
        interests: { $in: processedTags }
      });
    }

    // Emit notifications only to users with matching interests
    if (global.io && sameInterestUsers.length > 0) {
      sameInterestUsers.forEach((uid) => {
        global.io.to(uid.toString()).emit("new-interest", {
          title,
          description,
          tags: processedTags,
          createdBy: userName,
        });
      });
    }

    res.status(201).json({
      success: true,
      interest: newInterest,
    });
  } catch (error) {
    console.error("Error in addInterest controller:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//  Get all interests of logged-in user
export const getAllInterest = async (req, res) => {
  try {
    const userId = req.userId;

    const interests = await Interest.find({ userId })
      .sort({ createdAt: -1 })
      .populate(
        "userId",
        "fullName email"
      );

    res.status(200).json({
      success: true,
      message: "Your all interests.",
      interests: interests || [],
    });
  } catch (error) {
    console.log("Error in get all interest controller:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

//  Get all interests from all users (public feed)
export const getAllUsersInterest = async (req, res) => {
  try {
    const interests = await Interest.find()
      .sort({ createdAt: -1 })
      .populate(
        "userId",
        "fullName email"
      );

    res.status(200).json({
      success: true,
      message: "All posts fetched successfully.",
      interests: interests || [],
    });
  } catch (error) {
    console.log("Error in get all users interest controller:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

// Edit interest
export const editInterest = async (req, res) => {
  try {
    const { interestId } = req.params;
    const userId = req.userId;

    const updates = {};

    // Handle text fields
    if (req.body.title) updates.title = req.body.title;
    if (req.body.description) updates.description = req.body.description;
    
    // Handle tags
    if (req.body.tags) {
      const processedTags = Array.isArray(req.body.tags) 
        ? req.body.tags.map(tag => tag.toLowerCase().trim()).filter(Boolean)
        : [];
      updates.tags = processedTags;
    }

    // Handle image upload
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      if (!result) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
      updates.image = result.secure_url;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
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
        message: "Interest not found or not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interest updated successfully",
      interest,
    });
  } catch (error) {
    console.error("Error in edit interest controller:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

//  Get interest by ID
export const getInterestById = async (req, res) => {
  try {
    const { interestId } = req.params;
    const userId = req.userId;

    const interest = await Interest.findOne({
      _id: interestId,
      userId,
    }).populate("userId", "fullName email");

    if (!interest) {
      return res.status(404).json({
        success: false,
        message: "Not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Your interest",
      interest,
    });
  } catch (error) {
    console.log("Error in get interest by id in interest controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//Delete interest
export const deleteInterest = async (req, res) => {
  try {
    const { interestId } = req.params;
    const userId = req.userId;

    const interest = await Interest.findOneAndDelete({ _id: interestId, userId });

    if (!interest) {
      return res.status(404).json({
        success: false,
        message: "Not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interest deleted successfully",
      interest,
    });
  } catch (error) {
    console.log("Error in delete interest in interest controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get nearby interests
export const getNearByInterest = async (req, res) => {
  try {
    let { lng, lat, radius = 5000 } = req.query;

    // If no lng/lat passed, fallback to current user's location
    if (!lng || !lat) {
      const user = await User.findById(req.userId);
      if (!user?.location?.coordinates) {
        return res.status(400).json({
          success: false,
          message: "Location (lng, lat) is required or must be saved in profile",
        });
      }
      lng = user.location.coordinates[0];
      lat = user.location.coordinates[1];
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);

    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
      });
    }

    const interests = await Interest.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: parseInt(radius),
        },
      },
    }).populate("userId", "fullName email");

    res.status(200).json({
      success: true,
      count: interests.length,
      interests,
    });
  } catch (error) {
    console.log("Error in get nearby interests", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

// Get all interests by a specific user ID
export const getInterestsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const interests = await Interest.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName userName email");

    res.status(200).json({
      success: true,
      message: "User posts fetched successfully",
      interests: interests || [],
    });
  } catch (error) {
    console.log("Error in get interests by user ID:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};