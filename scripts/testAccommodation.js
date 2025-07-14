import mongoose from 'mongoose';
import dotenv from 'dotenv/config';
import Accommodation from '../model/accommodationModel.js';
import User from '../model/userModel.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test accommodation
const createTestAccommodation = async () => {
  try {
    // Find a user to associate with
    const user = await User.findOne({ email: 'user@test.com' });
    if (!user) {
      console.log('❌ Test user not found. Please create a user first.');
      return;
    }

    // Create test accommodation
    const testAccommodation = new Accommodation({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      title: 'Test Accommodation Request',
      message: 'This is a test accommodation request for testing status updates.',
      images: [],
      videos: [],
      status: 'pending',
      adminResponse: '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await testAccommodation.save();
    console.log('✅ Test accommodation created:', testAccommodation._id);
    console.log('📝 Status:', testAccommodation.status);
    
  } catch (error) {
    console.error('❌ Error creating test accommodation:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createTestAccommodation();
  process.exit(0);
};

main(); 