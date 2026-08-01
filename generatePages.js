const mongoose = require('mongoose');
const Page = require('../src/models/Page');
const axios = require('axios');
require('dotenv').config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

const categories = ['coupe', 'couleur', 'brushing', 'coiffage', 'traitement', 'extension', 'mariage', 'soin'];
const styles = ['classique', 'moderne', 'vintage', 'bohème', 'minimaliste', 'luxueux', 'naturel', 'audacieux'];

// Noms de coiffures uniques
const hairStyleNames = {
  coupe: ['Pixie Cut', 'Bob Chic', 'Lob Vague', 'Carré Parfait', 'Coupe Effilée', 'Coupe Plongeante', 'Coupe Graphique', 'Coupe Floue', 'Coupe Texturée', 'Coupe Élégante', 'Coupe Cascade', 'Coupe Aérienne', 'Coupe Féline', 'Coupe Romantique', 'Coupe Sculptée'],
  couleur: ['Blond Platinium', 'Brune Miel', 'Rousse Feu', 'Châtain Doré', 'Blond Cendré', 'Caramel Gloss', 'Cuivré Intense', 'Blond Vanille', 'Brun Ambré', 'Rouge Rubis', 'Blond Lumière', 'Noir Ébène', 'Miel Doré', 'Blond Champagne', 'Brun Mahogany'],
  brushing: ['Brushing Volumineux', 'Brushing Lisse', 'Brushing Ondulé', 'Brushing Soufflé', 'Brushing Glossy', 'Brushing Aérien', 'Brushing Naturel', 'Brushing Flou', 'Brushing Décoiffé', 'Brushing Élégant', 'Brushing Bohème', 'Brushing Chic'],
  coiffage: ['Chignon Élégant', 'Tresse Bohème', 'Queue de Cheval', 'Chignon Flou', 'Nœud Romantique', 'Tresse Couronne', 'Chignon Bas', 'Twist Glamour', 'Chignon Haut', 'Tresse Africaine', 'Nattes Artisanales'],
  traitement: ['Lissage Brésilien', 'Soin Kératine', 'Nutrition Intense', 'Brillance Extreme', 'Réparation Profonde', 'Soin Oléine', 'Traitement Luxe', 'Soin Résurrection'],
  extension: ['Extensions Volume', 'Extensions Longueur', 'Mèches Naturelles', 'Kératine Fusion', 'Band Weft', 'Micro Rings', 'Tape Extensions', 'Volume Supreme'],
  mariage: ['Chignon Romantique', 'Tresse Mariage', 'Voile Elégant', 'Coiffage Bohème', 'Chignon Perles', 'Tresse Couronne', 'Elégance Royale', 'Romantisme Pur'],
  soin: ['Spa Capillaire', 'Soin Hydratant', 'Masque Réparateur', 'Huile Nourrissante', 'Soin Anti-Frizz', 'Soin Volume', 'Soin Douceur']
};

const descriptions = {
  coupe: [
    'Une coupe audacieuse qui révèle votre personnalité. Parfaite pour un look moderne et affirmé.',
    'Cette coupe élégante sublime vos traits avec une technique de coupe précise et maîtrisée.',
    'Un carré revisité qui apporte structure et mouvement à votre chevelure.',
    'La coupe parfaite pour celles qui cherchent à allier style et praticité.',
    'Une coupe qui donne du volume et de la vie à vos cheveux.',
    'Le pixie cut moderne qui met en valeur votre visage avec élégance.'
  ],
  couleur: [
    'Cette coloration sublime vos cheveux avec des reflets dorés qui captent la lumière.',
    'Un blond lumineux qui illumine votre teint et donne de l\'éclat à votre regard.',
    'Des nuances châtain miel qui apportent chaleur et profondeur à votre chevelure.',
    'Le cuivré intense qui fait ressortir la beauté de votre peau.',
    'Un brun riche et profond qui donne du caractère à votre style.',
    'Le blond platinium, un classique intemporel pour une allure glamour.'
  ],
  brushing: [
    'Un brushing parfaitement lisse qui donne une brillance exceptionnelle à vos cheveux.',
    'Des ondulations naturelles qui apportent mouvement et légèreté.',
    'Un volume aérien qui donne du corps et de la vie à votre chevelure.',
    'Le brushing souple qui discipline vos cheveux sans les alourdir.',
    'Des boucles glamour pour un look sophistiqué et élégant.'
  ],
  coiffage: [
    'Un chignon romantique qui sublime votre nuque et votre visage.',
    'Une tresse bohème pour un look décontracté et élégant.',
    'Une queue de cheval parfaite, lisse et brillante.',
    'Un coiffage chic et intemporel pour toutes les occasions.',
    'Un nœud élégant qui apporte une touche de sophistication.'
  ],
  mariage: [
    'Une coiffure de mariage féérique qui vous fera sentir comme une princesse.',
    'Un chignon romantique orné de perles pour un look inoubliable.',
    'Une tresse couronne qui encadre votre visage avec délicatesse.',
    'Un coiffage élégant qui reste parfait toute la journée.',
    'Le romantisme absolu pour votre grand jour.'
  ]
};

const locations = [
  'Paris, France', 'Lyon, France', 'Nice, France', 'Marseille, France',
  'New York, USA', 'Los Angeles, USA', 'Miami, USA',
  'Londres, UK', 'Milan, Italie', 'Barcelone, Espagne',
  'Dubai, UAE', 'Tokyo, Japon', 'Sydney, Australie',
  'Berlin, Allemagne', 'Amsterdam, Pays-Bas'
];

const salonNames = [
  'AWA Luxury Salon', 'AWA Paris', 'AWA Studio', 'AWA Beauty House',
  'AWA Concept', 'AWA Art Studio', 'AWA Lounge', 'AWA Signature'
];

const stylistNames = [
  'Sarah Martinez', 'Maria Gonzalez', 'Jessica Wong', 'Laura Dupont',
  'Nina Petrova', 'Clara Silva', 'Alice Moreau', 'Emma Chen',
  'Sophie Lambert', 'Anna Kowalski', 'Mia Tanaka', 'Isabella Rossi'
];

const getImagesFromPexels = async (category, page = 1) => {
  const keywords = {
    coupe: 'haircut style',
    couleur: 'hair color',
    brushing: 'hair blowout',
    coiffage: 'hair styling',
    traitement: 'hair treatment',
    extension: 'hair extensions',
    mariage: 'wedding hair',
    soin: 'hair care'
  };
  
  const keyword = keywords[category] || 'hair';
  
  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: { 'Authorization': PEXELS_API_KEY },
      params: {
        query: keyword,
        per_page: 80,
        page: page,
        orientation: 'portrait',
        size: 'large'
      }
    });
    return response.data.photos || [];
  } catch (error) {
    console.error(`❌ Erreur Pexels:`, error.message);
    return [];
  }
};

const generateUniqueDescription = (index, category) => {
  const descList = descriptions[category] || descriptions.coupe;
  const baseDesc = descList[index % descList.length];
  
  const uniqueDetails = [
    `Cette création unique a été pensée pour sublimer votre beauté naturelle.`,
    `Une technique innovante pour un résultat spectaculaire.`,
    `Le style parfait pour les femmes modernes et audacieuses.`,
    `Une coiffure qui vous ressemble et vous met en valeur.`,
    `L'alliance parfaite entre tradition et modernité.`,
    `Un look qui attire tous les regards et fait sensation.`
  ];
  
  const detail = uniqueDetails[Math.floor(Math.random() * uniqueDetails.length)];
  return `${baseDesc} ${detail}`;
};

const generateContent = (index, category) => {
  const style = styles[index % styles.length];
  const nameList = hairStyleNames[category] || ['Style unique'];
  const name = nameList[index % nameList.length];
  
  return `
    <div class="page-content">
      <h1>${name}</h1>
      <p>${generateUniqueDescription(index, category)}</p>
      
      <h2>Détails du style</h2>
      <ul>
        <li><strong>Technique :</strong> ${style} cutting</li>
        <li><strong>Durée :</strong> ${45 + (index % 60)} minutes</li>
        <li><strong>Prix :</strong> $${(120 + (index % 280))}</li>
        <li><strong>Styliste :</strong> ${stylistNames[index % stylistNames.length]}</li>
        <li><strong>Salon :</strong> ${salonNames[index % salonNames.length]}</li>
        <li><strong>Localisation :</strong> ${locations[index % locations.length]}</li>
      </ul>
      
      <h3>Pourquoi ce style est unique</h3>
      <p>${generateUniqueDescription(index + 100, category)}</p>
      
      <h3>L'entretien</h3>
      <p>Pour préserver votre coiffure ${name} dans le temps, nous recommandons un entretien régulier avec nos produits AWA. Une visite de suivi est conseillée après ${3 + (index % 4)} semaines.</p>
      
      <h3>Ce que disent nos clientes</h3>
      <div class="reviews">
        ${generateReviews(index)}
      </div>
    </div>
  `;
};

const generateReviews = (index) => {
  const names = ['Marie', 'Sophie', 'Emma', 'Chloé', 'Léa', 'Sarah', 'Julie', 'Camille', 'Clara', 'Alice'];
  const reviews = [];
  const count = 3 + (index % 4);
  for (let i = 0; i < count; i++) {
    const name = names[(i + index) % names.length];
    const rating = 4 + Math.floor(Math.random() * 2);
    const comments = [
      'Magnifique ! Une véritable œuvre d\'art !',
      'Je suis conquise ! Le rendu est parfait.',
      'Un vrai talent ! Je recommande vivement.',
      'Je reviens chaque mois ! La qualité est constante.',
      'La meilleure coiffeuse que j\'ai connue !',
      'Service impeccable et résultat sublime.',
      'Une expérience exceptionnelle, merci AWA !',
      'Je n\'ai jamais eu une aussi belle coupe !'
    ];
    reviews.push(`
      <div class="review-card">
        <div class="stars">${'⭐'.repeat(rating)}</div>
        <p>"${comments[i % comments.length]}"</p>
        <p class="review-author">- ${name}</p>
      </div>
    `);
  }
  return reviews.join('');
};

const generatePages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔄 Génération des 1000 pages en cours...');

    await Page.deleteMany({});
    console.log('🗑️ Pages existantes supprimées');

    console.log('📸 Récupération des images depuis Pexels...');
    const allImages = {};
    
    for (const category of categories) {
      console.log(`  🔍 Recherche pour: ${category}...`);
      const images = await getImagesFromPexels(category);
      allImages[category] = images.map(img => img.src.large || img.src.original || img.src.medium);
      console.log(`  ✅ ${allImages[category].length} images trouvées`);
    }

    const pages = [];
    for (let i = 0; i < 1000; i++) {
      const category = categories[i % categories.length];
      const nameList = hairStyleNames[category] || ['Style Unique'];
      const styleName = nameList[i % nameList.length];
      const slug = styleName.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      const categoryImages = allImages[category] || [];
      const imageUrl = categoryImages.length > 0 
        ? categoryImages[i % categoryImages.length] 
        : `https://picsum.photos/seed/hair_${i}_${Date.now()}/800/600`;
      
      const pageData = {
        pageId: i + 1,
        title: styleName,
        slug: `${slug}-${i + 1}`,
        category: category,
        description: generateUniqueDescription(i, category),
        keywords: [category, styles[i % styles.length], 'coiffure', 'beauté', 'AWA', styleName.toLowerCase()],
        metaDescription: `${styleName} - ${category} - AWA HAIRCUT DESIGN`,
        content: generateContent(i, category),
        images: [
          {
            url: imageUrl,
            alt: `${styleName} - ${category}`
          }
        ],
        price: {
          min: 120 + (i % 280),
          max: 180 + (i % 350)
        },
        duration: 45 + (i % 60),
        stylist: {
          name: stylistNames[i % stylistNames.length],
          image: `https://picsum.photos/seed/stylist_${i}_${Date.now()}/150/150`,
          bio: `Styliste experte avec ${10 + (i % 15)} ans d'expérience. Spécialiste ${category}.`
        },
        location: locations[i % locations.length],
        relatedPages: [
          ((i + 1) % 1000) + 1,
          ((i + 3) % 1000) + 1,
          ((i + 5) % 1000) + 1,
          ((i + 7) % 1000) + 1,
          ((i + 11) % 1000) + 1
        ],
        tags: ['luxe', 'premium', 'coiffure', category, styles[i % styles.length], 'tendance', styleName.toLowerCase()],
        views: Math.floor(Math.random() * 10000)
      };

      pages.push(pageData);

      if ((i + 1) % 100 === 0) {
        console.log(`📄 ${i + 1}/1000 pages générées`);
      }
    }

    await Page.insertMany(pages);
    console.log('✅ 1000 pages générées avec succès !');
    
    const count = await Page.countDocuments();
    console.log(`📊 Total: ${count} pages dans la base`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

generatePages();
