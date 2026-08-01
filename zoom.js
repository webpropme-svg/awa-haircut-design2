// Fonction pour ouvrir l'image en plein écran
function openFullscreen(img) {
    // Récupérer la source de l'image
    const src = img.src || img.getAttribute('src');
    if (!src) return;

    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.92);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        animation: fadeIn 0.3s ease;
        padding: 2rem;
    `;

    // Image en grand
    const fullImg = document.createElement('img');
    fullImg.src = src;
    fullImg.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        animation: scaleIn 0.3s ease;
    `;

    // Bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 30px;
        font-size: 2.5rem;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        transition: transform 0.3s ease;
        font-weight: 300;
        opacity: 0.8;
    `;
    closeBtn.onmouseenter = () => closeBtn.style.transform = 'rotate(90deg)';
    closeBtn.onmouseleave = () => closeBtn.style.transform = 'rotate(0)';

    // Ajouter l'image à l'overlay
    overlay.appendChild(fullImg);
    overlay.appendChild(closeBtn);

    // Ajouter l'overlay au body
    document.body.appendChild(overlay);

    // Fermer au clic sur l'overlay
    overlay.addEventListener('click', function(e) {
        if (e.target === this || e.target === closeBtn) {
            closeFullscreen(overlay);
        }
    });

    // Fermer avec ESC
    const escHandler = function(e) {
        if (e.key === 'Escape') {
            closeFullscreen(overlay);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Fonction pour fermer
function closeFullscreen(overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        if (overlay.parentNode) overlay.remove();
    }, 300);
}

// Ajouter les styles d'animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    @keyframes scaleIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Ajouter un indicateur visuel sur les images cliquables
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.card-image img, .featured-card img, .gallery-item img');
    images.forEach(img => {
        img.style.cursor = 'pointer';
        img.title = 'Cliquez pour agrandir';
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            openFullscreen(this);
        });
    });
});
