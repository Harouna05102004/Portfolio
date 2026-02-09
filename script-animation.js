// script-animation.js

// Variables globales pour les animations
let canvas, ctx, particles = [];
const particleCount = window.innerWidth > 768 ? 100 : 50; // Moins de particules sur mobile
const maxSpeed = 0.5;

// Initialisation du canvas
function initCanvas() {
    canvas = document.getElementById('bg-canvas');
    if (!canvas) return; // Sécurité si le canvas n'existe pas
    ctx = canvas.getContext('2d');
    resizeCanvas();
    createParticles();
    animateCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * maxSpeed,
            vy: (Math.random() - 0.5) * maxSpeed,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.8 + 0.2
        });
    }
}

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`; // Couleur cyan pour matcher le thème
        ctx.fill();
    });
    requestAnimationFrame(animateCanvas);
}

// Animations d'entrée au scroll (fade-in + slide-up)
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Appliquer aux éléments clés sur toutes les pages
    document.querySelectorAll('.glass-card, .comp-card, .title, .header-title h1, .realisation, .detail-page .title').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Effet de gradient animé sur les textes (.gradient-text)
function animateGradientText() {
    const gradientTexts = document.querySelectorAll('.gradient-text');
    let offset = 0;
    function updateGradient() {
        offset += 0.01; // Vitesse de l'animation
        gradientTexts.forEach(text => {
            text.style.backgroundPosition = `${offset * 100}% 50%`;
        });
        requestAnimationFrame(updateGradient);
    }
    updateGradient();
}

// Hover renforcé sur les cartes (optionnel, pour plus d'interactivité)
function initHoverEffects() {
    document.querySelectorAll('.glass-card, .comp-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 20px 50px rgba(0, 212, 255, 0.3)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        });
    });
}

// Initialisation globale (s'exécute sur toutes les pages)
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initScrollAnimations();
    animateGradientText();
    initHoverEffects();
});