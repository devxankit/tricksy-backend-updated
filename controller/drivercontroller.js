import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import driverModel from '../model/driverModel.js';

// Driver Registration (by admin)
export const registerDriver = async (req, res) => {
    try {
        const { name, email, phone, address, password, busNumber } = req.body;

        // Check if driver already exists
        const existingDriver = await driverModel.findOne({ 
            $or: [{ email }, { phone }] 
        });
        
        if (existingDriver) {
            return res.status(400).json({ 
                message: 'Driver with this email or phone already exists' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new driver
        const newDriver = new driverModel({
            name,
            email,
            phone,
            address,
            password: hashedPassword,
            busNumber
        });

        await newDriver.save();

        res.status(201).json({
            message: 'Driver registered successfully',
            driver: {
                _id: newDriver._id,
                name: newDriver.name,
                email: newDriver.email,
                phone: newDriver.phone,
                address: newDriver.address,
                busNumber: newDriver.busNumber
            }
        });

    } catch (error) {
        console.error('Driver registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Driver Login
export const driverLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find driver by email
        const driver = await driverModel.findOne({ email });
        if (!driver) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, driver.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token with fallback secret
        const jwtSecret = process.env.JWTSECRET;
        const token = jwt.sign(
            { 
                id: driver._id, 
                email: driver.email, 
                role: 'driver' 
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Driver login successful',
            token,
            driver: {
                _id: driver._id,
                name: driver.name,
                email: driver.email,
                phone: driver.phone,
                address: driver.address,
                busNumber: driver.busNumber
            }
        });

    } catch (error) {
        console.error('Driver login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all drivers (admin only)
export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await driverModel.find({}, { password: 0 });
        res.status(200).json({ drivers });
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get driver profile
export const getDriverProfile = async (req, res) => {
    try {
        const driver = await driverModel.findById(req.user.id, { password: 0 });
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.status(200).json({ driver });
    } catch (error) {
        console.error('Get driver profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete driver (admin only)
export const deleteDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        
        const driver = await driverModel.findById(driverId);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        await driverModel.findByIdAndDelete(driverId);
        
        res.status(200).json({ 
            message: 'Driver deleted successfully',
            deletedDriver: {
                id: driver._id,
                name: driver.name,
                email: driver.email,
                busNumber: driver.busNumber
            }
        });
    } catch (error) {
        console.error('Delete driver error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
