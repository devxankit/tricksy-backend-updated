import Attendance from '../model/attendanceModel.js';
import User from '../model/userModel.js';
import Driver from '../model/driverModel.js';

// User or Driver marks attendance (check-in)
export const markAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notes, location, status } = req.body;

    let person, attendanceQuery = {}, attendanceData = {};
    if (req.user.role === 'driver') {
      person = await Driver.findById(userId);
      if (!person) return res.status(404).json({ message: 'Driver not found' });
      attendanceQuery.driverId = userId;
      attendanceData.driverId = userId;
      attendanceData.driverName = person.name;
      attendanceData.driverEmail = person.email;
    } else {
      person = await User.findById(userId);
      if (!person) return res.status(404).json({ message: 'User not found' });
      attendanceQuery.userId = userId;
      attendanceData.userId = userId;
      attendanceData.userName = person.name;
      attendanceData.userEmail = person.email;
    }

    // Check if attendance already marked for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    attendanceQuery.date = {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    };

    const existingAttendance = await Attendance.findOne(attendanceQuery);
    if (existingAttendance) {
      return res.status(400).json({
        message: 'Attendance already marked for today',
        attendance: existingAttendance
      });
    }

    let attendanceStatus = status || 'present';
    const now = new Date();
    const attendance = new Attendance({
      ...attendanceData,
      checkInTime: now,
      status: attendanceStatus,
      notes: notes || '',
      location: location || ''
    });

    await attendance.save();

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User or Driver checks out
export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notes } = req.body;

    let attendanceQuery = {};
    if (req.user.role === 'driver') {
      attendanceQuery.driverId = userId;
    } else {
      attendanceQuery.userId = userId;
    }

    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    attendanceQuery.date = {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    };

    const attendance = await Attendance.findOne(attendanceQuery);

    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record found for today' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out for today' });
    }

    // Update check-out time
    attendance.checkOutTime = new Date();
    if (notes) {
      attendance.notes = attendance.notes ? `${attendance.notes}; ${notes}` : notes;
    }

    await attendance.save();

    res.status(200).json({
      message: 'Check-out successful',
      attendance
    });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User or Driver gets their attendance history
export const getUserAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let query = {};
    if (req.user.role === 'driver') {
      query.driverId = userId;
    } else {
      query.userId = userId;
    }

    // Add date filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(30); // Limit to last 30 records

    res.status(200).json({
      message: 'Attendance records retrieved successfully',
      attendance
    });
  } catch (error) {
    console.error('Error fetching user attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin gets all attendance records
export const getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate, userId, status } = req.query;

    let query = {};
    
    // Add date filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Add user filter if provided
    if (userId) {
      query.userId = userId;
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email')
      .populate('driverId', 'name email')
      .sort({ date: -1, checkInTime: -1 });

    res.status(200).json({
      message: 'All attendance records retrieved successfully',
      attendance
    });
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin updates attendance status
export const updateAttendanceStatus = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, notes } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    attendance.status = status || attendance.status;
    if (notes) {
      attendance.notes = notes;
    }

    await attendance.save();

    res.status(200).json({
      message: 'Attendance status updated successfully',
      attendance
    });
  } catch (error) {
    console.error('Error updating attendance status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get attendance statistics
export const getAttendanceStats = async (req, res) => {
  try {
    // Calculate for today only
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    let query = {
      date: {
        $gte: today,
        $lt: tomorrow
      }
    };

    // Optionally filter by userId if provided
    if (req.query.userId) {
      query.userId = req.query.userId;
    }

    // Get all attendance records for today
    const totalRecords = await Attendance.countDocuments(query);
    const presentRecords = await Attendance.countDocuments({ ...query, status: 'present' });

    // Calculate percentage
    const percentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    res.status(200).json({
      message: 'Attendance statistics retrieved successfully',
      stats: { percentage },
      totalRecords,
      presentRecords
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 