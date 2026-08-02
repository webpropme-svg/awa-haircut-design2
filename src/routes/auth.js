const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Page de connexion
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Connexion - AWA HAIRCUT',
    currentYear: new Date().getFullYear(),
    error: null,
    success: null
  });
});

// Page d'inscription
router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'Inscription - AWA HAIRCUT',
    currentYear: new Date().getFullYear(),
    error: null,
    success: null
  });
});

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Inscription - AWA HAIRCUT',
        currentYear: new Date().getFullYear(),
        error: 'Cet email est déjà utilisé',
        success: null
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      isAdmin: email === 'admin@awahaircut.com',
      isActive: true
    });
    
    await user.save();
    
    res.render('auth/login', {
      title: 'Connexion - AWA HAIRCUT',
      currentYear: new Date().getFullYear(),
      success: '✅ Inscription réussie ! Connectez-vous.',
      error: null
    });
  } catch (error) {
    res.render('auth/register', {
      title: 'Inscription - AWA HAIRCUT',
      currentYear: new Date().getFullYear(),
      error: 'Erreur: ' + error.message,
      success: null
    });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', {
        title: 'Connexion - AWA HAIRCUT',
        currentYear: new Date().getFullYear(),
        error: 'Email ou mot de passe incorrect',
        success: null
      });
    }
    
    if (!user.isActive) {
      return res.render('auth/login', {
        title: 'Connexion - AWA HAIRCUT',
        currentYear: new Date().getFullYear(),
        error: 'Ce compte est désactivé',
        success: null
      });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.render('auth/login', {
        title: 'Connexion - AWA HAIRCUT',
        currentYear: new Date().getFullYear(),
        error: 'Email ou mot de passe incorrect',
        success: null
      });
    }
    
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.isAdmin = user.isAdmin || false;
    
    if (user.isAdmin) {
      return res.redirect('/admin');
    }
    
    res.redirect('/');
  } catch (error) {
    res.render('auth/login', {
      title: 'Connexion - AWA HAIRCUT',
      currentYear: new Date().getFullYear(),
      error: 'Erreur: ' + error.message,
      success: null
    });
  }
});

// Déconnexion
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
