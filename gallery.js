const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

router.get('/', async (req, res) => {
  try {
    const pages = await Page.find({ isActive: true })
      .sort({ views: -1 })
      .limit(100);
    
    res.render('gallery', {
      pages,
      currentYear: new Date().getFullYear(),
      title: 'Galerie - AWA HAIRCUT DESIGN'
    });
  } catch (error) {
    res.render('gallery', {
      pages: [],
      currentYear: new Date().getFullYear(),
      title: 'Galerie - AWA HAIRCUT DESIGN'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const page = await Page.findOne({ pageId: parseInt(req.params.id) });
    if (!page) return res.status(404).send('Page non trouvée');
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

module.exports = router;
