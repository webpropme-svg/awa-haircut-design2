const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

router.get('/:id', async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    
    if (pageId < 1 || pageId > 1000) {
      return res.status(404).render('pages/404', {
        title: 'Page non trouvée',
        currentYear: new Date().getFullYear()
      });
    }

    const page = await Page.findOne({ pageId });
    
    if (!page || !page.isActive) {
      return res.status(404).render('pages/404', {
        title: 'Page non trouvée',
        currentYear: new Date().getFullYear()
      });
    }

    page.views += 1;
    await page.save();

    const relatedPages = await Page.find({
      pageId: { $in: page.relatedPages },
      isActive: true
    }).limit(6);

    res.render('pages/page', {
      page,
      relatedPages,
      currentYear: new Date().getFullYear(),
      title: `${page.title} - AWA HAIRCUT DESIGN`
    });

  } catch (error) {
    console.error('Erreur page:', error);
    res.status(500).render('pages/500', {
      title: 'Erreur technique',
      currentYear: new Date().getFullYear()
    });
  }
});

router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const pages = await Page.find({
      $text: { $search: query },
      isActive: true
    }).limit(20);

    res.render('pages/search', {
      pages,
      query,
      currentYear: new Date().getFullYear(),
      title: `Recherche: ${query} - AWA HAIRCUT`
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur de recherche' });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const pages = await Page.find({
      category,
      isActive: true
    }).limit(50);

    res.render('pages/category', {
      pages,
      category,
      currentYear: new Date().getFullYear(),
      title: `${category} - AWA HAIRCUT DESIGN`
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur de filtrage' });
  }
});

router.get('/api/all', async (req, res) => {
  try {
    const pages = await Page.find({ isActive: true })
      .select('pageId title slug category description price duration views')
      .limit(100);
    res.json({ success: true, count: pages.length, pages });
  } catch (error) {
    res.status(500).json({ error: 'Erreur API' });
  }
});

module.exports = router;
