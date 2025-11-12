import { User } from "../models/userModel.js";

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { userName, fullName, DOB, email, interests } = req.body;

    const updates = {};

    if (typeof fullName === 'string' && fullName.trim().length > 0) {
      updates.fullName = fullName.trim();
    }

    if (typeof userName === 'string' && userName.trim().length > 0) {
      const normalized = userName.trim().toLowerCase();
      // ensure unique username excluding current user
      const existing = await User.findOne({ userName: normalized, _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Username already taken' });
      }
      updates.userName = normalized;
    }

    if (typeof email === 'string') {
      // optional: allow email change with uniqueness check
      const normalizedEmail = email.trim().toLowerCase();
      const emailExists = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      updates.email = normalizedEmail;
    }

    if (typeof DOB === 'string' || DOB instanceof Date) {
      const date = new Date(DOB);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid DOB' });
      }
      updates.DOB = date;
    }

    if (Array.isArray(interests)) {
      // Process interests - normalize and filter
      const processedInterests = interests
        .map(interest => interest.toLowerCase().trim())
        .filter(Boolean);
      updates.interests = processedInterests;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const updated = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select('-password');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, message: 'Profile updated', user: updated });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get another user's profile by userId
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user and exclude password
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


