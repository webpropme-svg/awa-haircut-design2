// Navigation mobile
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 AWA HAIRCUT DESIGN - Site chargé avec succès !');
    console.log('💎 1000 pages de coiffure d\'exception');
    
    // Animation des statistiques
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.textContent);
        if (target > 0) {
            let current = 0;
            const increment = Math.ceil(target / 50);
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = current + '+';
            }, 30);
        }
    });

    // Effet de parallaxe sur le hero
    const hero = document.querySelector('.hero-section');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
        });
    }

    // Animation des cartes au scroll
    const cards = document.querySelectorAll('.featured-card, .category-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });

    // Gestion du formulaire de réservation
    const bookingForm = document.querySelector('#booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/booking/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('✅ Réservation confirmée !');
                    bookingForm.reset();
                }
            } catch (error) {
                alert('❌ Erreur lors de la réservation');
            }
        });
    }

    // Gestion du formulaire de recherche
    const searchForm = document.querySelector('#search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.querySelector('#search-input').value;
            if (query.trim()) {
                window.location.href = `/pages/search/${encodeURIComponent(query)}`;
            }
        });
    }

    // Dark mode toggle (optionnel)
    const darkModeToggle = document.querySelector('#dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });
    }
});

// Fonction pour charger plus de pages
async function loadMorePages(page = 1) {
    try {
        const response = await fetch(`/pages/api/all?page=${page}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur de chargement:', error);
        return null;
    }
}

// Gestion des avis client
function submitReview(pageId, rating, comment) {
    // Simulation - à connecter avec une vraie API
    console.log('Avis soumis:', { pageId, rating, comment });
    alert('Merci pour votre avis !');
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadMorePages, submitReview };
}
