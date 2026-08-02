const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const galleryRoutes = require('./routes/gallery');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');
const pagesRoutes = require('./routes/pages');
const contactRoutes = require('./routes/contact');
const servicesRoutes = require('./routes/services');
const newsletterRoutes = require('./routes/newsletter');
const reviewsRoutes = require('./routes/reviews');

// Middleware user
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? {
    id: req.session.userId,
    name: req.session.userName || 'Utilisateur',
    email: req.session.userEmail,
    role: req.session.userRole || 'user',
    isAdmin: req.session.isAdmin || false
  } : null;
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/gallery', galleryRoutes);
app.use('/booking', bookingRoutes);
app.use('/admin', adminRoutes);
app.use('/pages', pagesRoutes);
app.use('/contact', contactRoutes);
app.use('/services', servicesRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/reviews', reviewsRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('pages/404', { 
    title: 'Page non trouvée', 
    currentYear: new Date().getFullYear() 
  });
});

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connecté');
  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Serveur sur port ${process.env.PORT || 3000}`);
  });
})
.catch(err => console.error('❌ MongoDB:', err));
