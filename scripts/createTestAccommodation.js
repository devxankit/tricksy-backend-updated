import mongoose from 'mongoose';
import Accommodation from '../model/accommodationModel.js';
import User from '../model/userModel.js';
import dotenv from 'dotenv/config';

const createTestAccommodation = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a test user
        const user = await User.findOne({ email: 'user@tricksy.com' });
        if (!user) {
            console.log('No test user found. Please run createTestData.js first.');
            process.exit(1);
        }

        // Create a test accommodation with sample images
        const testAccommodation = new Accommodation({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            title: 'Test Accommodation Request',
            message: 'This is a test accommodation request with sample images.',
            images: [
                '/uploads/test-image-1.jpg',
                '/uploads/test-image-2.jpg'
            ],
            videos: [],
            status: 'pending'
        });

        await testAccommodation.save();
        console.log('✅ Test accommodation created successfully!');
        console.log('📋 Accommodation ID:', testAccommodation._id);
        console.log('📷 Images:', testAccommodation.images);

    } catch (error) {
        console.error('❌ Error creating test accommodation:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createTestAccommodation(); 