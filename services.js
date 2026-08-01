const express = require('express');
const router = express.Router();

// Page Services
router.get('/', (req, res) => {
  const services = [
    {
      id: 1,
      title: '✂️ Coupe de cheveux',
      description: 'Coupe tendance et personnalisée réalisée par nos experts stylistes. Du carré au pixie cut, nous trouvons la coupe qui vous sublime.',
      price: '$120 - $250',
      duration: '45-60 min',
      icon: 'fa-cut'
    },
    {
      id: 2,
      title: '🎨 Coloration',
      description: 'Coloration professionnelle aux reflets sublimes. Blond platinium, brun miel, rousse feu ou châtain doré, nous créons la couleur qui vous ressemble.',
      price: '$150 - $350',
      duration: '60-90 min',
      icon: 'fa-palette'
    },
    {
      id: 3,
      title: '💨 Brushing & Coiffage',
      description: 'Brushing parfait et volumineux ou coiffage élégant pour toutes les occasions. Un style frais, dynamique et durable.',
      price: '$80 - $200',
      duration: '30-60 min',
      icon: 'fa-wind'
    },
    {
      id: 4,
      title: '💆 Traitement capillaire',
      description: 'Traitement profond pour des cheveux en pleine santé. Nutrition, hydratation, réparation et brillance garanties avec nos produits haut de gamme.',
      price: '$100 - $250',
      duration: '45-75 min',
      icon: 'fa-spa'
    },
    {
      id: 5,
      title: '📏 Extensions',
      description: 'Extensions de cheveux naturelles pour une longueur et un volume exceptionnels. Résultat époustouflant et naturel.',
      price: '$300 - $800',
      duration: '90-120 min',
      icon: 'fa-ruler'
    },
    {
      id: 6,
      title: '💍 Coiffure de mariage',
      description: 'Coiffure de mariage féérique et romantique. Chignon élégant, tresse bohème ou voile délicat, nous créons le look inoubliable pour votre grand jour.',
      price: '$250 - $600',
      duration: '60-90 min',
      icon: 'fa-ring'
    },
    {
      id: 7,
      title: '🌿 Soin capillaire',
      description: 'Soin luxueux avec des produits haut de gamme. Des cheveux doux, brillants, revitalisés et en pleine santé.',
      price: '$80 - $180',
      duration: '30-45 min',
      icon: 'fa-leaf'
    },
    {
      id: 8,
      title: '👑 Coiffage événementiel',
      description: 'Coiffage élégant et raffiné pour vos événements spéciaux. Soirées, galas, cocktails ou cérémonies, nous vous préparons un look qui fait sensation.',
      price: '$150 - $400',
      duration: '45-75 min',
      icon: 'fa-crown'
    }
  ];

  res.render('services', {
    title: 'Nos Services - AWA HAIRCUT DESIGN',
    currentYear: new Date().getFullYear(),
    services: services
  });
});

module.exports = router;
