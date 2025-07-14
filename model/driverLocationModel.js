import mongoose from 'mongoose';

const driverLocationSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  busNumber: {
    type: String,
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    accuracy: {
      type: Number,
      default: 0
    }
  },
  address: {
    type: String,
    default: ''
  },
  speed: {
    type: Number,
    default: 0
  },
  heading: {
    type: Number,
    default: 0
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient queries
driverLocationSchema.index({ driverId: 1 });
driverLocationSchema.index({ lastUpdated: -1 });
driverLocationSchema.index({ isOnline: 1 });

const driverLocationModel = mongoose.model('DriverLocation', driverLocationSchema);

export default driverLocationModel; 