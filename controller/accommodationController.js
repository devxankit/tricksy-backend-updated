import Accommodation from '../model/accommodationModel.js';
import User from '../model/userModel.js';
import Admin from '../model/adminModel.js';

// User creates accommodation request
const createAccommodation = async (req, res) => {
  try {
    const { title, message } = req.body;
    const userId = req.user.id; // From auth middleware

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process uploaded files
    const images = req.files?.images ? req.files.images.map(file => `/uploads/${file.filename}`) : [];
    const videos = req.files?.videos ? req.files.videos.map(file => `/uploads/${file.filename}`) : [];

    const accommodation = new Accommodation({
      userId,
      userName: user.name,
      userEmail: user.email,
      title,
      message,
      images,
      videos
    });

    await accommodation.save();

    res.status(201).json({
      message: 'Accommodation request created successfully',
      accommodation
    });
  } catch (error) {
    console.error('Error creating accommodation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User gets their accommodation requests
const getUserAccommodations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const accommodations = await Accommodation.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Accommodations retrieved successfully',
      accommodations
    });
  } catch (error) {
    console.error('Error fetching user accommodations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin gets all accommodation requests
const getAllAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'All accommodations retrieved successfully',
      accommodations
    });
  } catch (error) {
    console.error('Error fetching all accommodations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin updates accommodation status and response
const updateAccommodation = async (req, res) => {
  try {
    const { accommodationId } = req.params;
    const { status, adminResponse } = req.body;
    const adminId = req.user.id; // From auth middleware

    // Get admin details
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation request not found' });
    }

    // Update accommodation
    accommodation.status = status || accommodation.status;
    accommodation.adminResponse = adminResponse || accommodation.adminResponse;
    accommodation.adminId = adminId;
    accommodation.adminName = admin.name;

    await accommodation.save();

    res.status(200).json({
      message: 'Accommodation updated successfully',
      accommodation
    });
  } catch (error) {
    console.error('❌ Error updating accommodation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single accommodation by ID
const getAccommodationById = async (req, res) => {
  try {
    const { accommodationId } = req.params;
    
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation request not found' });
    }

    res.status(200).json({
      message: 'Accommodation retrieved successfully',
      accommodation
    });
  } catch (error) {
    console.error('Error fetching accommodation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete accommodation (admin only)
const deleteAccommodation = async (req, res) => {
  try {
    const { accommodationId } = req.params;
    
    const accommodation = await Accommodation.findByIdAndDelete(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation request not found' });
    }

    res.status(200).json({
      message: 'Accommodation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting accommodation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  createAccommodation,
  getUserAccommodations,
  getAllAccommodations,
  updateAccommodation,
  getAccommodationById,
  deleteAccommodation
}; 