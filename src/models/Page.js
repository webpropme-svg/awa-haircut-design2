const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  pageId: { type: Number, required: true, unique: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: {
    type: String,
    required: true,
    enum: ['coupe', 'couleur', 'brushing', 'coiffage', 'traitement', 'extension', 'mariage', 'soin']
  },
  description: { type: String, required: true },
  keywords: [String],
  metaDescription: String,
  content: { type: String, required: true },
  images: [{
    url: String,
    alt: String,
    publicId: String
  }],
  video: String,
  price: { min: Number, max: Number },
  duration: Number,
  stylist: {
    name: String,
    image: String,
    bio: String
  },
  clientReviews: [{
    name: String,
    avatar: String,
    rating: Number,
    comment: String,
    date: Date
  }],
  relatedPages: [Number],
  tags: [String],
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

pageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

pageSchema.index({ title: 'text', description: 'text', content: 'text' });

module.exports = mongoose.model('Page', pageSchema);
