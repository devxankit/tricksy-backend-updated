import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import adminModel from '../model/adminModel.js';

// Admin Login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin by email
        const admin = await adminModel.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token with fallback secret
        const jwtSecret = process.env.JWTSECRET || 'fallback-secret-key';
        const token = jwt.sign(
            { 
                id: admin._id, 
                email: admin.email, 
                role: 'admin' 
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Admin login successful',
            token,
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        console.error('Error stack:', error.stack);
        console.error('JWTSECRET value:', process.env.JWTSECRET);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all admins (protected route)
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await adminModel.find({}, { password: 0 });
        res.status(200).json({ admins });
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};