const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

router.get('/', async (req, res) => {
  try {
    const featuredPages = await Page.find({ isActive: true })
      .sort({ views: -1 })
      .limit(12);
    
    const categories = await Page.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.render('index', {
      featuredPages,
      categories,
      currentYear: new Date().getFullYear(),
      title: 'AWA HAIRCUT DESIGN - Coiffure de Luxe'
    });
  } catch (error) {
    res.render('index', {
      featuredPages: [],
      categories: [],
      currentYear: new Date().getFullYear(),
      title: 'AWA HAIRCUT DESIGN'
    });
  }
});

router.get('/about', (req, res) => {
  res.render('about', {
    currentYear: new Date().getFullYear(),
    title: 'À propos - AWA HAIRCUT DESIGN'
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', {
    currentYear: new Date().getFullYear(),
    title: 'Contact - AWA HAIRCUT DESIGN',
    success: null,
    error: null
  });
});

module.exports = router;
