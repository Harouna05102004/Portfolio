// ==================== CONFIGURATION ==================== //
const CONFIG = {
    particleCount: window.innerWidth > 768 ? 80 : 40,
    maxSpeed: 0.4,
    connectionDistance: 150,
    particleSize: { min: 1, max: 2.5 }
};

// ==================== VARIABLES GLOBALES ==================== //
let canvas, ctx, particles = [];
let mouseX = 0, mouseY = 0;
let animationFrame;

// ==================== INITIALISATION ==================== //
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initNavbar();
    initScrollAnimations();
    initSmoothScroll();
    initMobileMenu();
    initGradientAnimation();
    initLazyLoad();
    initHoverEffects();
});

// ==================== CANVAS PARTICLES ==================== //
function initCanvas() {
    canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    createParticles();
    animateCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 250));
    window.addEventListener('mousemove', throttle(updateMousePosition, 50));
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (particles.length === 0) createParticles();
}

function createParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * CONFIG.maxSpeed,
            vy: (Math.random() - 0.5) * CONFIG.maxSpeed,
            size: Math.random() * (CONFIG.particleSize.max - CONFIG.particleSize.min) + CONFIG.particleSize.min,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

function updateMousePosition(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
            const force = (150 - distance) / 150;
            p.x -= dx * force * 0.01;
            p.y -= dy * force * 0.01;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
        ctx.fill();
        particles.slice(i + 1).forEach(p2 => {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONFIG.connectionDistance) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                const opacity = (1 - dist / CONFIG.connectionDistance) * 0.15;
                ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });
    });
    animationFrame = requestAnimationFrame(animateCanvas);
}

// ==================== NAVBAR ==================== //
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', throttle(() => {
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveNavLink();
    }, 100));
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar .menu li a');
    let currentSection = '';
    sections.forEach(section => {
        if (window.pageYOffset >= section.offsetTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// ==================== MENU BURGER MOBILE (Fix iOS Safari) ==================== //
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.navbar .menu');
    if (!menuToggle || !menu) return;

    let isOpen = false;

    function openMenu() {
        isOpen = true;
        menuToggle.classList.add('active');
        menu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        isOpen = false;
        menuToggle.classList.remove('active');
        menu.classList.remove('active');
        document.body.style.overflow = '';
    }

    function toggleMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        isOpen ? closeMenu() : openMenu();
    }

    // Clic normal + touch pour iOS
    menuToggle.addEventListener('click', toggleMenu, { passive: false });
    menuToggle.addEventListener('touchstart', toggleMenu, { passive: false });

    // Fermer en cliquant sur un lien
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
        link.addEventListener('touchstart', closeMenu, { passive: true });
    });

    // Fermer en cliquant en dehors
    document.addEventListener('click', (e) => {
        if (isOpen && !menu.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMenu();
        }
    });

    document.addEventListener('touchstart', (e) => {
        if (isOpen && !menu.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMenu();
        }
    }, { passive: true });
}

// ==================== SMOOTH SCROLL ==================== //
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (!target) return;
            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        });
    });
}

// ==================== ANIMATIONS AU SCROLL ==================== //
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const elements = document.querySelectorAll(`
        .glass-card, .comp-card, .project-card,
        .expertise-card, .stat-card, .realisation,
        .section-title, .about-text, .contact-method
    `);

    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.08}s, transform 0.6s ease ${index * 0.08}s`;
        observer.observe(el);
    });
}

// ==================== GRADIENT ANIMÉ ==================== //
function initGradientAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .gradient-text {
            background-size: 200% 200%;
            animation: gradientShift 4s ease infinite;
        }
    `;
    document.head.appendChild(style);
}

// ==================== LAZY LOAD IMAGES ==================== //
function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    images.forEach(img => imageObserver.observe(img));
}

// ==================== HOVER EFFECTS ==================== //
function initHoverEffects() {
    document.querySelectorAll('.glass-card, .comp-card, .project-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 20px 60px rgba(0, 212, 255, 0.3)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        });
    });

    document.querySelectorAll('.card-icon, .expertise-icon, .project-icon').forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
            this.style.transition = 'transform 0.3s ease';
        });
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });
}

// ==================== COMPTEURS ANIMÉS ==================== //
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    function update() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(update);
        } else {
            element.textContent = target + '+';
        }
    }
    update();
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.textContent);
            if (!isNaN(target)) animateCounter(entry.target, target);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => statsObserver.observe(stat));

// ==================== SCROLL TO TOP ==================== //
const scrollTopBtn = document.querySelector('.scroll-top');
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==================== UTILITAIRES ==================== //
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==================== NETTOYAGE ==================== //
window.addEventListener('beforeunload', () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
});