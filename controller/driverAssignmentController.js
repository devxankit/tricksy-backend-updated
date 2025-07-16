import driverAssignmentModel from '../model/driverAssignmentModel.js';
import userModel from '../model/userModel.js';
import driverModel from '../model/driverModel.js';
import driverLocationModel from '../model/driverLocationModel.js';

// Admin assigns driver to pick up multiple users
export const assignDriverToUsers = async (req, res) => {
  try {
    const { 
      driverId, 
      userIds, // Array of user IDs
      pickupLocation, 
      dropLocation, 
      pickupCoordinates,
      dropCoordinates,
      notes 
    } = req.body;
    const adminId = req.user.id;
    const adminName = req.user.name || 'Admin';

    // Validate coordinates
    const validateCoordinates = (coords, locationName) => {
      if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
        return { valid: false, message: `${locationName} coordinates are required and must be numbers` };
      }
      if (coords.latitude < -90 || coords.latitude > 90) {
        return { valid: false, message: `${locationName} latitude must be between -90 and 90` };
      }
      if (coords.longitude < -180 || coords.longitude > 180) {
        return { valid: false, message: `${locationName} longitude must be between -180 and 180` };
      }
      return { valid: true };
    };

    // Validate pickup coordinates
    const pickupValidation = validateCoordinates(pickupCoordinates, 'Pickup');
    if (!pickupValidation.valid) {
      return res.status(400).json({ message: pickupValidation.message });
    }

    // Validate drop coordinates
    const dropValidation = validateCoordinates(dropCoordinates, 'Drop');
    if (!dropValidation.valid) {
      return res.status(400).json({ message: dropValidation.message });
    }

    // Validate driver exists
    const driver = await driverModel.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Validate all users exist
    const users = await userModel.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(404).json({ message: 'One or more users not found' });
    }

    // Check if any user is already assigned to an active assignment
    const existingAssignments = await driverAssignmentModel.find({
      'assignedUsers.userId': { $in: userIds },
      status: 'active'
    });

    if (existingAssignments.length > 0) {
      return res.status(400).json({ 
        message: 'One or more users are already assigned to an active driver' 
      });
    }

    // Create assigned users array
    const assignedUsers = users.map(user => ({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      status: 'pending'
    }));

    // Create new driver assignment
    const newAssignment = new driverAssignmentModel({
      driverId,
      driverName: driver.name,
      driverEmail: driver.email,
      busNumber: driver.busNumber,
      pickupLocation,
      pickupCoordinates,
      dropLocation,
      dropCoordinates,
      assignedUsers,
      notes: notes || '',
      assignedBy: adminId,
      assignedByName: adminName
    });

    await newAssignment.save();

    res.status(201).json({
      message: `Successfully assigned ${users.length} users to driver ${driver.name}`,
      assignment: newAssignment,
      driver: {
        id: driver._id,
        name: driver.name,
        busNumber: driver.busNumber
      },
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }))
    });

  } catch (error) {
    console.error('Driver assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all driver assignments (admin)
export const getAllDriverAssignments = async (req, res) => {
  try {
    const assignments = await driverAssignmentModel.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      assignments
    });
  } catch (error) {
    console.error('Get driver assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get assignments for specific driver
export const getDriverAssignments = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.query; // Add query parameter for status filter
    
    // Validate driverId
    if (!driverId || driverId === 'undefined' || driverId === 'null' || driverId === 'tasks') {
      return res.status(400).json({ 
        message: 'Invalid driver ID provided',
        assignments: []
      });
    }

    // Validate ObjectId format
    if (!driverId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid driver ID format',
        assignments: []
      });
    }
    
    // Build query based on status filter
    let query = { driverId };
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['active', 'completed'] };
    }
    
    const assignments = await driverAssignmentModel.find(query).sort({ assignmentDate: -1 });

    res.status(200).json({
      assignments
    });
  } catch (error) {
    console.error('Get driver assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get assignment for specific user
export const getUserAssignment = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const assignment = await driverAssignmentModel.findOne({
      'assignedUsers.userId': userId,
      status: { $in: ['active', 'completed'] }
    }).sort({ assignmentDate: -1 });

    if (!assignment) {
      return res.status(404).json({ message: 'No active assignment found for user' });
    }

    res.status(200).json({
      assignment
    });
  } catch (error) {
    console.error('Get user assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Driver updates user status (picked/dropped)
export const updateUserStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { userId, status } = req.body;
    const driverId = req.user.id;

    if (!['picked', 'dropped'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "picked" or "dropped"' });
    }

    const assignment = await driverAssignmentModel.findOne({
      _id: assignmentId,
      driverId,
      status: 'active'
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Find and update the specific user's status
    const userIndex = assignment.assignedUsers.findIndex(user => user.userId.toString() === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found in this assignment' });
    }

    assignment.assignedUsers[userIndex].status = status;
    assignment.updatedAt = new Date();

    // Check if all users are dropped to mark assignment as completed
    const allDropped = assignment.assignedUsers.every(user => user.status === 'dropped');
    if (allDropped) {
      assignment.status = 'completed';
    }

    await assignment.save();

    res.status(200).json({
      message: `User status updated to ${status}`,
      assignment
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get driver location for user
export const getUserAssignedDriverLocation = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's active assignment
    const assignment = await driverAssignmentModel.findOne({
      'assignedUsers.userId': userId,
      status: 'active'
    });

    if (!assignment) {
      return res.status(404).json({ message: 'No active assignment found for user' });
    }

    // Get driver location
    const driverLocation = await driverLocationModel.findOne({
      driverId: assignment.driverId,
      isOnline: true,
      lastUpdated: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (!driverLocation) {
      return res.status(404).json({ message: 'Assigned driver is currently offline' });
    }

    // Calculate distance to pickup and drop locations
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    let distanceToPickup = null;
    let distanceToDrop = null;

    if (assignment.pickupCoordinates) {
      distanceToPickup = calculateDistance(
        driverLocation.location.latitude,
        driverLocation.location.longitude,
        assignment.pickupCoordinates.latitude,
        assignment.pickupCoordinates.longitude
      );
    }

    if (assignment.dropCoordinates) {
      distanceToDrop = calculateDistance(
        driverLocation.location.latitude,
        driverLocation.location.longitude,
        assignment.dropCoordinates.latitude,
        assignment.dropCoordinates.longitude
      );
    }

    res.status(200).json({
      driverLocation: {
        ...driverLocation.toObject(),
        distanceToPickup,
        distanceToDrop,
        assignment: {
          pickupLocation: assignment.pickupLocation,
          dropLocation: assignment.dropLocation,
          pickupCoordinates: assignment.pickupCoordinates,
          dropCoordinates: assignment.dropCoordinates,
          driverName: assignment.driverName,
          busNumber: assignment.busNumber
        }
      }
    });

  } catch (error) {
    console.error('Get user assigned driver location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update assignment status (admin)
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, notes } = req.body;

    const assignment = await driverAssignmentModel.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.status = status;
    if (notes) {
      assignment.notes = notes;
    }
    assignment.updatedAt = new Date();

    await assignment.save();

    res.status(200).json({
      message: 'Assignment status updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete assignment (admin only)
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await driverAssignmentModel.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await driverAssignmentModel.findByIdAndDelete(assignmentId);

    res.status(200).json({
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 