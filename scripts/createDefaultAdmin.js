import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import adminModel from '../model/adminModel.js';
import dotenv from 'dotenv/config';

const createDefaultAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if default admin already exists
        const existingAdmin = await adminModel.findOne({ email: 'admin@tricksy.com' });
        
        if (existingAdmin) {
            console.log('Default admin already exists!');
            console.log('Email: admin@tricksy.com');
            console.log('Password: admin123');
            process.exit(0);
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);

        // Create default admin
        const defaultAdmin = new adminModel({
            name: 'Default Admin',
            email: 'admin@tricksy.com',
            phone: '1234567890',
            password: hashedPassword
        });

        await defaultAdmin.save();
        console.log('✅ Default admin created successfully!');
        console.log('📧 Email: admin@tricksy.com');
        console.log('🔑 Password: admin123');
        console.log('🆔 Admin ID:', defaultAdmin._id);

    } catch (error) {
        console.error('❌ Error creating default admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createDefaultAdmin(); 