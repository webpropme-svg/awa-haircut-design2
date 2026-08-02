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
    success: req.query.success || null
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

// Traitement de l'inscription
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
      isAdmin: email === 'admin@awahaircut.com' ? true : false,
      isActive: true
    });
    
    await user.save();
    
    // Rediriger vers la page de connexion avec message de succès
    res.redirect('/auth/login?success=Inscription réussie ! Connectez-vous maintenant.');
  } catch (error) {
    res.render('auth/register', {
      title: 'Inscription - AWA HAIRCUT',
      currentYear: new Date().getFullYear(),
      error: 'Erreur: ' + error.message,
      success: null
    });
  }
});

// Traitement de la connexion
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
    req.session.userRole = user.isAdmin ? 'admin' : 'user';
    
    // Rediriger vers l'accueil
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
