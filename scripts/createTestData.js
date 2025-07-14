import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import userModel from '../model/userModel.js';
import driverModel from '../model/driverModel.js';
import dotenv from 'dotenv/config';

const createTestData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const saltRounds = 10;

        // Create test users
        const testUsers = [
            {
                name: 'John User',
                email: 'user@tricksy.com',
                phone: '1111111111',
                address: '123 Main Street, City',
                password: await bcrypt.hash('user123', saltRounds)
            },
            {
                name: 'Jane User',
                email: 'jane@tricksy.com',
                phone: '2222222222',
                address: '456 Oak Avenue, Town',
                password: await bcrypt.hash('user123', saltRounds)
            }
        ];

        // Create test drivers (add address and busNumber fields)
        const testDrivers = [
            {
                name: 'Mike Driver',
                email: 'driver@tricksy.com',
                phone: '3333333333',
                address: '789 Pine Road, City',
                busNumber: 'BUS123',
                password: await bcrypt.hash('driver123', saltRounds)
            },
            {
                name: 'Sarah Driver',
                email: 'sarah@tricksy.com',
                phone: '4444444444',
                address: '101 Maple Lane, Town',
                busNumber: 'BUS789',
                password: await bcrypt.hash('driver123', saltRounds)
            }
        ];

        // Add users
        for (const userData of testUsers) {
            const existingUser = await userModel.findOne({ email: userData.email });
            if (!existingUser) {
                const user = new userModel(userData);
                await user.save();
                console.log(`✅ User created: ${userData.email}`);
            } else {
                console.log(`ℹ️ User already exists: ${userData.email}`);
            }
        }

        // Add drivers
        for (const driverData of testDrivers) {
            const existingDriver = await driverModel.findOne({ email: driverData.email });
            if (!existingDriver) {
                const driver = new driverModel(driverData);
                await driver.save();
                console.log(`✅ Driver created: ${driverData.email}`);
            } else {
                console.log(`ℹ️ Driver already exists: ${driverData.email}`);
            }
        }

        console.log('\n🎉 Test data creation completed!');
        console.log('\n📋 Login Credentials:');
        console.log('👨‍💼 Admin: admin@tricksy.com / admin123');
        console.log('👤 Users: user@tricksy.com / user123, jane@tricksy.com / user123');
        console.log('🚗 Drivers: driver@tricksy.com / driver123, sarah@tricksy.com / driver123');

    } catch (error) {
        console.error('❌ Error creating test data:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createTestData(); 