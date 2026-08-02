const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// S'abonner à la newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requis' });
    }
    
    // Vérifier si l'email existe déjà
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cet email est déjà abonné' 
      });
    }
    
    // Créer l'abonnement
    const subscription = new Newsletter({
      email,
      name: name || '',
      isActive: true
    });
    
    await subscription.save();
    
    res.json({ 
      success: true, 
      message: '✅ Abonnement réussi ! Vous recevrez nos actualités.' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de l\'abonnement' 
    });
  }
});

// Se désabonner
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requis' });
    }
    
    const subscription = await Newsletter.findOne({ email });
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        error: 'Email non trouvé' 
      });
    }
    
    subscription.isActive = false;
    await subscription.save();
    
    res.json({ 
      success: true, 
      message: '✅ Désabonnement réussi' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors du désabonnement' 
    });
  }
});

// API: Récupérer tous les abonnés (pour admin)
router.get('/api/subscribers', async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true })
      .sort({ subscribedAt: -1 });
    
    res.json({ 
      success: true, 
      count: subscribers.length,
      subscribers 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erreur' 
    });
  }
});

module.exports = router;
