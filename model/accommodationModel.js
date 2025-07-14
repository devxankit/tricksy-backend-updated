import mongoose from 'mongoose';

const accommodationSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String, // URLs to stored images
    required: false
  }],
  videos: [{
    type: String, // URLs to stored videos
    required: false
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-progress'],
    default: 'pending'
  },
  adminResponse: {
    type: String,
    trim: true,
    default: ''
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  },
  adminName: {
    type: String,
    required: false
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

// Update the updatedAt field before saving
accommodationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Accommodation', accommodationSchema); 