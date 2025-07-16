import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../model/userModel.js';

// User Registration (by admin)
export const registerUser = async (req, res) => {
    try {
        const { name, email, phone, address, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ 
            $or: [{ email }, { phone }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email or phone already exists' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new userModel({
            name,
            email,
            phone,
            address,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address
            }
        });

    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// User Login
export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token with fallback secret
        const jwtSecret = process.env.JWTSECRET ;
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: 'user' 
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'User login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address
            }
        });

    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, { password: 0 });
        res.status(200).json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id, { password: 0 });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, phone, address } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        await user.save();
        res.status(200).json({ message: 'Profile updated successfully', user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address
        }});
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await userModel.findByIdAndDelete(userId);
        
        res.status(200).json({ 
            message: 'User deleted successfully',
            deletedUser: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 