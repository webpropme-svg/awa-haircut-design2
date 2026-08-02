const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const User = require('../models/User');

// Page de contact
router.get('/', (req, res) => {
  res.render('contact', {
    title: 'Contact - AWA HAIRCUT DESIGN',
    currentYear: new Date().getFullYear(),
    success: null,
    error: null
  });
});

// Envoyer un message
router.post('/send', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.render('contact', {
        title: 'Contact - AWA HAIRCUT DESIGN',
        currentYear: new Date().getFullYear(),
        error: 'Tous les champs sont obligatoires',
        success: null
      });
    }
    
    let userId = null;
    if (req.session.userId) {
      userId = req.session.userId;
    }
    
    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      userId,
      status: 'unread'
    });
    
    await contact.save();
    
    res.render('contact', {
      title: 'Contact - AWA HAIRCUT DESIGN',
      currentYear: new Date().getFullYear(),
      success: '✅ Votre message a été envoyé ! Nous vous répondrons dans les plus brefs délais.',
      error: null
    });
  } catch (error) {
    res.render('contact', {
      title: 'Contact - AWA HAIRCUT DESIGN',
      currentYear: new Date().getFullYear(),
      error: 'Erreur: ' + error.message,
      success: null
    });
  }
});

module.exports = router;
