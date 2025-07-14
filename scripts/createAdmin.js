import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import adminModel from '../model/adminModel.js';
import dotenv from 'dotenv/config';

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');

        // Check if admin already exists
        const existingAdmin = await adminModel.findOne({ email: 'admin@tricksy.com' });
        
        if (existingAdmin) {
            console.log('✅ Admin already exists!');
            console.log('📧 Email: admin@tricksy.com');
            console.log('🔑 Password: admin123');
            console.log('🆔 Admin ID:', existingAdmin._id);
            
            // Test the password
            const isPasswordValid = await bcrypt.compare('admin123', existingAdmin.password);
            console.log('🔐 Password validation:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
            
            process.exit(0);
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);

        // Create admin with exact data from MongoDB Atlas
        const admin = new adminModel({
            name: 'Default Admin',
            email: 'admin@tricksy.com',
            phone: '1234567890',
            password: hashedPassword
        });

        await admin.save();
        console.log('✅ Admin created successfully!');
        console.log('📧 Email: admin@tricksy.com');
        console.log('🔑 Password: admin123');
        console.log('🆔 Admin ID:', admin._id);

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createAdmin(); 