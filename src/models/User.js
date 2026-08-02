const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'stylist', 'admin'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profileImage: String,
  phone: String,
  isActive: {
    type: Boolean,
    default: true
  },
  favorites: [Number],
  bookings: [{
    pageId: Number,
    pageTitle: String,
    date: Date,
    time: String,
    stylist: String,
    price: Number,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'refused'],
      default: 'pending'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  contactMessages: [{
    subject: String,
    message: String,
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reviews: [{
    pageId: Number,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
