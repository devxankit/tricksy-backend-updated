import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: {
    type: String,
    required: false
  },
  userEmail: {
    type: String,
    required: false
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: false
  },
  driverName: {
    type: String,
    required: false
  },
  driverEmail: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  checkInTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound indexes for userId+date and driverId+date to prevent duplicate entries
attendanceSchema.index({ userId: 1, date: 1 }, { unique: false });
attendanceSchema.index({ driverId: 1, date: 1 }, { unique: false });

// Update the updatedAt field before saving
attendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Attendance', attendanceSchema); 