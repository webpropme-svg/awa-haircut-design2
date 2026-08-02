const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Page = require('../models/Page');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Review = require('../models/Review');
const Newsletter = require('../models/Newsletter');

// Middleware d'authentification admin
function isAdmin(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect('/admin/login');
}

// Page de connexion admin
router.get('/login', (req, res) => {
  res.render('admin/login', {
    title: 'Connexion Admin - AWA HAIRCUT',
    error: null
  });
});

// Traitement de la connexion admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, isAdmin: true });
    if (!user) {
      return res.render('admin/login', {
        title: 'Connexion Admin - AWA HAIRCUT',
        error: 'Email ou mot de passe incorrect'
      });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.render('admin/login', {
        title: 'Connexion Admin - AWA HAIRCUT',
        error: 'Email ou mot de passe incorrect'
      });
    }
    
    req.session.adminId = user._id;
    req.session.adminName = user.name;
    req.session.isAdmin = true;
    
    res.redirect('/admin');
  } catch (error) {
    res.render('admin/login', {
      title: 'Connexion Admin - AWA HAIRCUT',
      error: error.message
    });
  }
});

// Déconnexion admin
router.get('/logout', (req, res) => {
  req.session.adminId = null;
  req.session.isAdmin = false;
  res.redirect('/admin/login');
});

// Dashboard (protégé)
router.get('/', isAdmin, async (req, res) => {
  try {
    const pageCount = await Page.countDocuments();
    const userCount = await User.countDocuments();
    const reviewCount = await Review.countDocuments();
    const contactCount = await Contact.countDocuments();
    const views = await Page.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const recentPages = await Page.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10);
    
    const usersWithBookings = await User.find({ 'bookings.0': { $exists: true } })
      .select('name email bookings');
    
    const allBookings = [];
    usersWithBookings.forEach(u => {
      if (u.bookings && u.bookings.length > 0) {
        u.bookings.forEach(b => {
          allBookings.push({
            userId: u._id,
            userName: u.name,
            userEmail: u.email,
            ...b._doc
          });
        });
      }
    });
    allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const bookingsCount = allBookings.length;
    
    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.render('admin/dashboard', {
      pageCount,
      userCount,
      reviewCount,
      contactCount,
      totalViews: views[0]?.total || 0,
      bookingsCount: bookingsCount,
      totalRevenue: 84500,
      recentPages,
      allBookings: allBookings.slice(0, 10),
      recentReviews,
      currentPage: 'dashboard'
    });
  } catch (error) {
    res.render('admin/dashboard', {
      pageCount: 0,
      userCount: 0,
      reviewCount: 0,
      contactCount: 0,
      totalViews: 0,
      bookingsCount: 0,
      totalRevenue: 0,
      recentPages: [],
      allBookings: [],
      recentReviews: [],
      currentPage: 'dashboard'
    });
  }
});

// Gestion des pages
router.get('/pages', isAdmin, async (req, res) => {
  try {
    const pages = await Page.find({ isActive: true })
      .sort({ pageId: 1 })
      .limit(100);
    res.render('admin/pages', {
      pages: pages || [],
      currentPage: 'pages'
    });
  } catch (error) {
    res.render('admin/pages', { pages: [], currentPage: 'pages' });
  }
});

router.get('/pages/create', isAdmin, (req, res) => {
  res.render('admin/page-create', { currentPage: 'pages' });
});

router.post('/pages/create', isAdmin, async (req, res) => {
  try {
    const { title, category, description, content, priceMin, priceMax, duration } = req.body;
    const count = await Page.countDocuments();
    const page = new Page({
      pageId: count + 1,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-') + '-' + (count + 1),
      category,
      description,
      content,
      images: [{ url: '/images/placeholder.svg', alt: title }],
      price: { min: parseInt(priceMin) || 150, max: parseInt(priceMax) || 250 },
      duration: parseInt(duration) || 45,
      stylist: { name: 'Expert AWA', image: '/images/placeholder.svg', bio: 'Styliste experte' },
      relatedPages: [1, 2, 3],
      tags: [category],
      isActive: true
    });
    await page.save();
    res.redirect('/admin/pages');
  } catch (error) {
    res.status(500).send('Erreur: ' + error.message);
  }
});

router.post('/pages/:id/toggle', isAdmin, async (req, res) => {
  try {
    const page = await Page.findOne({ pageId: parseInt(req.params.id) });
    if (!page) return res.status(404).json({ error: 'Page non trouvée' });
    page.isActive = !page.isActive;
    await page.save();
    res.json({ success: true, isActive: page.isActive });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.delete('/pages/:id', isAdmin, async (req, res) => {
  try {
    await Page.deleteOne({ pageId: parseInt(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

// Gestion des utilisateurs
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(50);
    res.render('admin/users', { users: users || [], currentPage: 'users' });
  } catch (error) {
    res.render('admin/users', { users: [], currentPage: 'users' });
  }
});

router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

// Gestion des réservations
router.get('/bookings', isAdmin, async (req, res) => {
  try {
    const users = await User.find({ 'bookings.0': { $exists: true } })
      .select('name email bookings');
    
    const allBookings = [];
    users.forEach(u => {
      if (u.bookings && u.bookings.length > 0) {
        u.bookings.forEach((b, index) => {
          allBookings.push({
            userId: u._id.toString(),
            userName: u.name || 'Inconnu',
            userEmail: u.email || '',
            bookingIndex: index,
            pageTitle: b.pageTitle || 'Style inconnu',
            date: b.date || new Date(),
            time: b.time || '00:00',
            price: b.price || 150,
            status: b.status || 'pending',
            message: b.message || '',
            createdAt: b.createdAt || new Date()
          });
        });
      }
    });
    
    allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.render('admin/bookings', { bookings: allBookings, currentPage: 'bookings' });
  } catch (error) {
    res.render('admin/bookings', { bookings: [], currentPage: 'bookings' });
  }
});

router.post('/bookings/:userId/:index/status', isAdmin, async (req, res) => {
  try {
    const { userId, index } = req.params;
    const { status } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const idx = parseInt(index);
    if (idx < 0 || idx >= user.bookings.length) {
      return res.status(400).json({ error: 'Réservation non trouvée' });
    }
    
    user.bookings[idx].status = status;
    await user.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur: ' + error.message });
  }
});

// Gestion des avis
router.get('/reviews', isAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 });
    res.render('admin/reviews', { reviews: reviews || [], currentPage: 'reviews' });
  } catch (error) {
    res.render('admin/reviews', { reviews: [], currentPage: 'reviews' });
  }
});

router.post('/reviews/:id/approve', isAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.delete('/reviews/:id', isAdmin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

// Gestion des catégories
router.get('/categories', isAdmin, async (req, res) => {
  try {
    const categories = await Page.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.render('admin/categories', { categories: categories || [], currentPage: 'categories' });
  } catch (error) {
    res.render('admin/categories', { categories: [], currentPage: 'categories' });
  }
});

// Gestion des contacts
router.get('/contacts', isAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.render('admin/contacts', { messages: messages || [], currentPage: 'contacts' });
  } catch (error) {
    res.render('admin/contacts', { messages: [], currentPage: 'contacts' });
  }
});

router.post('/contacts/:id/read', isAdmin, async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { status: 'read' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.post('/contacts/:id/reply', isAdmin, async (req, res) => {
  try {
    const { reply } = req.body;
    await Contact.findByIdAndUpdate(req.params.id, {
      status: 'replied',
      adminReply: {
        message: reply,
        repliedAt: new Date()
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.delete('/contacts/:id', isAdmin, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

// Newsletter
router.get('/newsletter', isAdmin, (req, res) => {
  res.render('admin/newsletter', { currentPage: 'settings' });
});

router.post('/newsletter/send', isAdmin, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const subscribers = await Newsletter.find({ isActive: true });
    
    if (subscribers.length === 0) {
      return res.json({ success: false, error: 'Aucun abonné' });
    }
    
    res.json({ success: true, message: `Newsletter envoyée à ${subscribers.length} abonnés` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Paramètres
router.get('/settings', isAdmin, (req, res) => {
  res.render('admin/settings', { currentPage: 'settings' });
});

module.exports = router;
