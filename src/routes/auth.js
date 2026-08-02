const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Contact = require('../models/Contact');

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
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Inscription - AWA HAIRCUT',
        currentYear: new Date().getFullYear(),
        error: 'Cet email est déjà utilisé',
        success: null
      });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: 'user',
      isActive: true
    });
    
    await user.save();
    
    res.render('auth/login', {
      title: 'Connexion - AWA HAIRCUT',
      currentYear: new Date().getFullYear(),
      success: 'Inscription réussie ! Connectez-vous maintenant.',
      error: null
    });
  } catch (error) {
    res.render('auth/register', {
      title: 'Inscription - AWA HAIRCUT',
      currentYear: new Date().getFullYear(),
      error: 'Erreur lors de l\'inscription: ' + error.message,
      success: null
    });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', {
        title: 'Connexion - AWA HAIRCUT',
        currentYear: new Date().getFullYear(),
        error: 'Email ou mot de passe incorrect',
        success: null
      });
    }
    
    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.render('auth/login', {
        title: 'Connexion - AWA HAIRCUT',
        currentYear: new Date().getFullYear(),
        error: 'Ce compte a été désactivé',
        success: null
      });
    }
    
    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.render('auth/login', {
        title: 'Connexion - AWA HAIRCUT',
        currentYear: new Date().getFullYear(),
        error: 'Email ou mot de passe incorrect',
        success: null
      });
    }
    
    // Créer la session
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    
    // Rediriger vers la page d'accueil
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

// Page profil
router.get('/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/auth/login');
    }
    
    res.render('auth/profile', {
      title: 'Mon profil - AWA HAIRCUT',
      currentYear: new Date().getFullYear(),
      user: user
    });
  } catch (error) {
    res.redirect('/');
  }
});

// Mettre à jour le profil
router.post('/profile/update', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non connecté' });
  }
  
  try {
    const { name, phone } = req.body;
    await User.findByIdAndUpdate(req.session.userId, { name, phone });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
