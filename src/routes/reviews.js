const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');

// Page des avis
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const stats = await Review.aggregate([
      { $match: { isApproved: true } },
      { $group: { 
        _id: null, 
        average: { $avg: '$rating' },
        total: { $sum: 1 }
      }}
    ]);
    
    const averageRating = stats.length > 0 ? stats[0].average.toFixed(1) : 0;
    const totalReviews = stats.length > 0 ? stats[0].total : 0;
    
    let user = null;
    if (req.session && req.session.userId) {
      user = await User.findById(req.session.userId);
    }
    
    res.render('reviews', {
      title: 'Avis clients - AWA HAIRCUT DESIGN',
      currentYear: new Date().getFullYear(),
      reviews,
      averageRating,
      totalReviews,
      user: user
    });
  } catch (error) {
    console.error('Erreur reviews page:', error);
    res.render('reviews', {
      title: 'Avis clients - AWA HAIRCUT DESIGN',
      currentYear: new Date().getFullYear(),
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      user: null
    });
  }
});

// Ajouter un avis
router.post('/add', async (req, res) => {
  try {
    console.log('📝 Ajout avis...');
    
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Connectez-vous' 
      });
    }
    
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ 
        success: false, 
        error: 'Note et commentaire requis' 
      });
    }
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    const review = new Review({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      rating: parseInt(rating),
      comment: comment.trim(),
      isApproved: true
    });
    
    await review.save();
    console.log('✅ Avis enregistré!');
    
    res.json({ 
      success: true, 
      message: 'Merci pour votre avis !' 
    });
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// API
router.get('/api/all', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/:id/approve', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/api/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
