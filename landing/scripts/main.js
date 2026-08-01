document.addEventListener('DOMContentLoaded', () => {

    // ─── Sticky Navbar with shrink ──────────────
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ─── Mobile Menu Toggle ──────────────────────
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // ─── Intersection Observer (Scroll Animations) ─
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { rootMargin: '0px', threshold: 0.12 });

    document.querySelectorAll('.fade-in-up, .fade-in').forEach(el => {
        observer.observe(el);
    });

    // ─── Parallax on Hero Mockup ────────────────
    const heroMockup = document.getElementById('heroMockup');
    if (heroMockup) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < 800) {
                heroMockup.style.transform = `translateY(${scrollY * 0.08}px)`;
            }
        }, { passive: true });
    }

    // ─── Feature Card Tilt Effect ────────────────
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -3;
            const rotateY = (x - centerX) / centerX * 3;
            
            card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ─── Smooth Scroll for anchor links ──────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ─── Staggered animation for grid items ──────
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll('.feature-card, .step, .tech-card');
                items.forEach((item, index) => {
                    item.style.transitionDelay = `${index * 0.08}s`;
                    item.classList.add('visible');
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.features-grid, .steps-grid, .tech-grid').forEach(grid => {
        staggerObserver.observe(grid);
    });

});
