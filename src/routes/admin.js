const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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
    req.session.isAdmin = true;
    
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.render('admin/login', {
      title: 'Connexion Admin - AWA HAIRCUT',
      error: error.message
    });
  }
});

// Déconnexion admin
router.get('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/admin/login');
});

module.exports = router;
