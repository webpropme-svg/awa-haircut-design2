const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import des routes
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

// Middleware pour passer l'utilisateur à toutes les vues
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? {
    id: req.session.userId,
    name: req.session.userName,
    email: req.session.userEmail,
    role: req.session.userRole
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

// Page 404
app.use((req, res) => {
  res.status(404).render('pages/404', { 
    title: 'Page non trouvée - AWA HAIRCUT',
    currentYear: new Date().getFullYear()
  });
});

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connexion MongoDB établie');
  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 AWA HAIRCUT DESIGN lancé sur le port ${process.env.PORT || 3000}`);
    console.log(`🌐 http://localhost:${process.env.PORT || 3000}`);
    console.log(`📄 1000 pages générées dynamiquement`);
  });
})
.catch(err => {
  console.error('❌ Erreur MongoDB:', err);
});
