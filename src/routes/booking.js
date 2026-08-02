const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const User = require('../models/User');
const { sendBookingConfirmation } = require('../utils/email');

// Page de réservation
router.get('/', async (req, res) => {
  try {
    const pages = await Page.find({ isActive: true })
      .select('pageId title price duration stylist category')
      .limit(20);
    
    let user = null;
    if (req.session.userId) {
      user = await User.findById(req.session.userId);
    }
    
    res.render('booking', {
      pages,
      user,
      currentYear: new Date().getFullYear(),
      title: 'Réservation - AWA HAIRCUT DESIGN',
      success: null,
      error: null
    });
  } catch (error) {
    res.render('booking', {
      pages: [],
      user: null,
      currentYear: new Date().getFullYear(),
      title: 'Réservation - AWA HAIRCUT DESIGN',
      success: null,
      error: 'Erreur de chargement'
    });
  }
});

// Créer une réservation
router.post('/create', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Vous devez être connecté pour réserver',
        redirect: '/auth/login'
      });
    }
    
    const { pageId, date, time, message } = req.body;
    
    if (!pageId || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tous les champs sont obligatoires' 
      });
    }
    
    const page = await Page.findOne({ pageId: parseInt(pageId) });
    if (!page) {
      return res.status(404).json({ 
        success: false, 
        error: 'Style non trouvé' 
      });
    }
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    const booking = {
      pageId: page.pageId,
      pageTitle: page.title,
      date: new Date(date),
      time: time,
      stylist: page.stylist?.name || 'Expert AWA',
      price: page.price?.min || 150,
      status: 'pending',
      message: message || '',
      createdAt: new Date()
    };
    
    user.bookings.push(booking);
    await user.save();
    
    // Envoyer l'email de confirmation
    try {
      await sendBookingConfirmation(user.email, user.name, booking);
    } catch (emailError) {
      console.error('Erreur email:', emailError);
      // L'email échoue mais la réservation est enregistrée
    }
    
    res.json({ 
      success: true, 
      message: '✅ Réservation créée avec succès ! Un email de confirmation vous a été envoyé.',
      booking: booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Mes réservations
router.get('/my-bookings', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/auth/login');
    }
    
    res.render('booking/my-bookings', {
      title: 'Mes réservations - AWA HAIRCUT',
      currentYear: new Date().getFullYear(),
      user: user,
      bookings: user.bookings || []
    });
  } catch (error) {
    res.redirect('/');
  }
});

// Annuler une réservation
router.post('/cancel/:index', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, error: 'Non connecté' });
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    
    const index = parseInt(req.params.index);
    if (index < 0 || index >= user.bookings.length) {
      return res.status(400).json({ success: false, error: 'Réservation non trouvée' });
    }
    
    user.bookings[index].status = 'cancelled';
    await user.save();
    
    res.json({ success: true, message: 'Réservation annulée' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Récupérer toutes les réservations (pour admin)
router.get('/api/all', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Non connecté' });
    }
    
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const allUsers = await User.find({ 'bookings.0': { $exists: true } })
      .select('name email bookings');
    
    const allBookings = [];
    allUsers.forEach(u => {
      u.bookings.forEach(b => {
        allBookings.push({
          userName: u.name,
          userEmail: u.email,
          ...b._doc
        });
      });
    });
    
    allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ success: true, bookings: allBookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
