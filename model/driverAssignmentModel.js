import mongoose from 'mongoose';

const driverAssignmentSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  driverEmail: {
    type: String,
    required: true
  },
  busNumber: {
    type: String,
    required: true
  },
  pickupLocation: {
    type: String,
    required: true,
    trim: true
  },
  pickupCoordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  dropLocation: {
    type: String,
    required: true,
    trim: true
  },
  dropCoordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  assignedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    userPhone: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'picked', 'dropped'],
      default: 'pending'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  assignedByName: {
    type: String,
    required: true
  },
  assignmentDate: {
    type: Date,
    required: true,
    default: Date.now
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

// Create indexes for efficient queries
driverAssignmentSchema.index({ driverId: 1, status: 1 });
driverAssignmentSchema.index({ 'assignedUsers.userId': 1, status: 1 });
driverAssignmentSchema.index({ assignmentDate: 1 });

const driverAssignmentModel = mongoose.model('DriverAssignment', driverAssignmentSchema);

export default driverAssignmentModel; 