document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for fade-in animations on scroll
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Parallax effect for Mystery Layer
    const mysteryLayer = document.querySelector('.mystery-layer');
    if (mysteryLayer) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            mysteryLayer.style.transform = `translateY(${scrolled * 0.3}px)`;
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Navigation Toggle Logic
    const navToggle = document.querySelector('.nav-toggle');
    const navOverlay = document.querySelector('.nav-overlay');
    const body = document.body;
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navOverlay) {
        navToggle.addEventListener('click', () => {
            toggleNav();
        });

        // Close when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeNav();
            });
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navOverlay.classList.contains('active')) {
                closeNav();
            }
        });

        // Close when clicking outside content (on the overlay background)
        navOverlay.addEventListener('click', (e) => {
            if (e.target === navOverlay) {
                closeNav();
            }
        });
    }

    function toggleNav() {
        navToggle.classList.toggle('nav-active');
        navOverlay.classList.toggle('active');
        body.classList.toggle('nav-open');
    }

    function closeNav() {
        navToggle.classList.remove('nav-active');
        navOverlay.classList.remove('active');
        body.classList.remove('nav-open');
    }

    // Magnetic Button + Decrypt Effect
    const magneticBtn = document.querySelector('.magnetic-button');
    if (magneticBtn) {
        const textSpan = magneticBtn.querySelector('.btn-text');
        const originalText = magneticBtn.dataset.textOriginal;
        const hoverText = magneticBtn.dataset.textHover;
        let decryptInterval = null;

        // Magnetic Physics
        magneticBtn.addEventListener('mousemove', (e) => {
            const rect = magneticBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Pull factor (0.4 = strong pull)
            magneticBtn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
        });

        magneticBtn.addEventListener('mouseleave', () => {
            // Snap back
            magneticBtn.style.transform = 'translate(0, 0)';

            // Revert Text
            stopDecrypt();
            textSpan.textContent = originalText;
        });

        // Decrypt / Glitch Animation
        magneticBtn.addEventListener('mouseenter', () => {
            let iteration = 0;
            const target = hoverText;
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

            stopDecrypt();

            decryptInterval = setInterval(() => {
                textSpan.innerText = target
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return target[index];
                        }
                        return letters[Math.floor(Math.random() * 26)]; // Use restricted set for cleaner look
                    })
                    .join("");

                if (iteration >= target.length) {
                    stopDecrypt();
                }

                iteration += 1 / 3; // Speed control
            }, 30);
        });

        function stopDecrypt() {
            clearInterval(decryptInterval);
        }
    }
});
