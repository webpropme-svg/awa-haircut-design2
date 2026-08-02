const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const User = require('../models/User');

// Middleware : vérifier si l'utilisateur est admin
function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
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
    const { email } = req.body;
    
    const user = await User.findOne({ email, isAdmin: true });
    if (!user) {
      return res.render('admin/login', {
        title: 'Connexion Admin - AWA HAIRCUT',
        error: 'Email admin non trouvé'
      });
    }
    
    req.session.isAdmin = true;
    req.session.adminId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    
    res.redirect('/admin');
  } catch (error) {
    res.render('admin/login', {
      title: 'Connexion Admin - AWA HAIRCUT',
      error: error.message
    });
  }
});

// Dashboard admin
router.get('/', isAdmin, async (req, res) => {
  try {
    const pageCount = await Page.countDocuments();
    const userCount = await User.countDocuments();
    
    res.render('admin/dashboard', {
      pageCount,
      userCount,
      currentPage: 'dashboard'
    });
  } catch (error) {
    res.render('admin/dashboard', {
      pageCount: 0,
      userCount: 0,
      currentPage: 'dashboard'
    });
  }
});

// Déconnexion admin
router.get('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/admin/login');
});

module.exports = router;
