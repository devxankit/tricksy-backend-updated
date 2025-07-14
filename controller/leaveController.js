import Leave from '../model/leaveModel.js';
import driverModel from '../model/driverModel.js';

// Driver or User applies for leave
export const applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        let leaveData = { startDate, endDate, reason };
        if (req.user.role === 'driver') {
            leaveData.driver = req.user.id;
        } else if (req.user.role === 'user') {
            leaveData.user = req.user.id;
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        console.log('Saving leave:', leaveData); 
        const newLeave = new Leave(leaveData);
        await newLeave.save();
        res.status(201).json({ message: 'Leave applied successfully', leave: newLeave });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Driver or User views their own leaves
export const getMyLeaves = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'driver') {
            query.driver = req.user.id;
        } else if (req.user.role === 'user') {
            query.user = req.user.id;
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        console.log('Querying leaves with:', query); 
        const leaves = await Leave.find(query).sort({ appliedAt: -1 });
        res.status(200).json({ leaves });
    } catch (error) {
        console.error('Get my leaves error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Admin views all leaves
export const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate('driver', 'name email busNumber');
        res.status(200).json({ leaves });
    } catch (error) {
        console.error('Get all leaves error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Admin updates leave status
export const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminResponse } = req.body; // 'approved' or 'rejected' and optional adminResponse
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const update = { status };
        if (adminResponse !== undefined) update.adminResponse = adminResponse;
        const leave = await Leave.findByIdAndUpdate(id, update, { new: true });
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        res.status(200).json({ message: 'Leave status updated', leave });
    } catch (error) {
        console.error('Update leave status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get leaves by status (for admin or driver)
export const getLeavesByStatus = async (req, res) => {
    try {
        const { status } = req.params; // 'pending', 'approved', 'rejected'
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        let query = { status };
        // If driver, only show their own leaves
        if (req.user.role === 'driver') {
            query.driver = req.user.id;
        }
        const leaves = await Leave.find(query).populate('driver', 'name email busNumber');
        res.status(200).json({ leaves });
    } catch (error) {
        console.error('Get leaves by status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 