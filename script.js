document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // TYPEWRITER SETUP — save tagline text early
    // ============================================
    const taglineEl = document.querySelector('.tagline');
    let taglineText = '';
    if (taglineEl) {
        taglineText = taglineEl.textContent;
        taglineEl.textContent = '';
        taglineEl.setAttribute('data-fulltext', taglineText);
    }

    // ============================================
    // GLITCH CORRUPTION INTRO
    // ============================================
    const glitchIntro = document.getElementById('glitch-intro');

    if (glitchIntro) {
        document.body.classList.add('loading');

        const canvas = document.getElementById('glitch-canvas');
        const ctx = canvas.getContext('2d');
        const titleEl = document.getElementById('glitch-title');
        const byEl = document.getElementById('glitch-by');

        let animFrame;
        let phase = 'noise'; // noise → reveal → clean → done
        let phaseStart = Date.now();

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        function drawNoise(intensity) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const numBars = Math.floor(intensity * 18);
            for (let i = 0; i < numBars; i++) {
                const y = Math.random() * canvas.height;
                const h = 2 + Math.random() * 22;
                const shift = (Math.random() - 0.5) * 80 * intensity;
                // Slice a strip of current pixels and shift it
                const alpha = 0.06 + Math.random() * 0.14;
                ctx.fillStyle = `rgba(255,0,51,${alpha * intensity})`;
                ctx.fillRect(0, y, canvas.width, h);
                // Horizontal white noise bar
                if (Math.random() < 0.4) {
                    ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.06})`;
                    ctx.fillRect(0, y, canvas.width, h * 0.5);
                }
            }
        }

        let glitchTitleIntensity = 0;

        function loop() {
            const now = Date.now();
            const elapsed = now - phaseStart;

            if (phase === 'noise') {
                // Heavy noise for 1.2s
                drawNoise(1.0);
                if (elapsed > 400) {
                    // Title starts appearing through noise
                    glitchTitleIntensity = Math.min(1, (elapsed - 400) / 600);
                    titleEl.style.opacity = glitchTitleIntensity;
                }
                if (elapsed > 1200) {
                    phase = 'reveal';
                    phaseStart = now;
                }
            } else if (phase === 'reveal') {
                // Reducing noise, title stabilizing
                const t = elapsed / 800;
                drawNoise(Math.max(0, 1 - t));
                titleEl.classList.toggle('active-glitch', Math.random() > 0.55);
                if (elapsed > 800) {
                    phase = 'clean';
                    phaseStart = now;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    titleEl.classList.remove('active-glitch');
                    titleEl.classList.add('settled');
                    byEl.style.opacity = '1';
                }
            } else if (phase === 'clean') {
                // Hold clean for 1s then dissolve
                if (elapsed > 1000) {
                    phase = 'done';
                    cancelAnimationFrame(animFrame);
                    return;
                }
            }

            animFrame = requestAnimationFrame(loop);
        }

        window.addEventListener('load', () => {
            const hero = document.querySelector('#hero');
            phaseStart = Date.now();
            loop();

            // Total: ~3s then dissolve into hero
            setTimeout(() => {
                glitchIntro.classList.add('dissolve');
                document.body.classList.remove('loading');
                if (hero) hero.classList.add('visible', 'hero-enter');

                // Start typewriter after hero entrance begins
                startTypewriter();
            }, 3100);

            setTimeout(() => glitchIntro.remove(), 4400);
        });
    } else {
        window.addEventListener('load', () => {
            const hero = document.querySelector('#hero');
            if (hero) hero.classList.add('visible');
            startTypewriter();
        });
    }

    // ============================================
    // TYPEWRITER EFFECT — one-shot, zero ongoing cost
    // ============================================
    function startTypewriter() {
        if (!taglineEl || !taglineText) return;

        // Wait for presenter + title to finish their entrance
        setTimeout(() => {
            taglineEl.classList.add('typewriter-active');
            let i = 0;

            function typeChar() {
                if (i < taglineText.length) {
                    taglineEl.textContent += taglineText.charAt(i);
                    i++;
                    // Variable speed for realism: slower on punctuation
                    const char = taglineText.charAt(i - 1);
                    const delay = '.,"!?—'.includes(char) ? 120 : (40 + Math.random() * 35);
                    setTimeout(typeChar, delay);
                } else {
                    // Done — keep cursor blinking briefly, then remove
                    setTimeout(() => {
                        taglineEl.classList.remove('typewriter-active');
                        taglineEl.classList.add('typewriter-done');
                    }, 1500);
                }
            }

            typeChar();
        }, 600); // Delay after hero-enter to let title reveal first
    }

    // ============================================
    // FULL-PAGE SCROLL ENGINE
    // ============================================
    const sections = document.querySelectorAll('section');
    const allSections = Array.from(sections);
    let currentIndex = 0;
    let isScrolling = false;
    const scrollCooldown = 900; // ms before next scroll allowed

    function scrollToSection(index) {
        if (index < 0 || index >= allSections.length || isScrolling) return;
        isScrolling = true;
        currentIndex = index;

        allSections[index].scrollIntoView({ behavior: 'smooth' });

        // Show floating buy button after hero
        const floatingBtn = document.getElementById('floating-buy');
        if (floatingBtn) {
            if (index > 0) {
                floatingBtn.classList.add('visible');
            } else {
                floatingBtn.classList.remove('visible');
            }
        }

        setTimeout(() => {
            isScrolling = false;
        }, scrollCooldown);
    }

    // Mouse wheel handler
    window.addEventListener('wheel', (e) => {
        if (isScrolling) return;
        // Ignore if nav overlay is open
        if (document.body.classList.contains('nav-open')) return;

        if (e.deltaY > 0) {
            scrollToSection(currentIndex + 1);
        } else if (e.deltaY < 0) {
            scrollToSection(currentIndex - 1);
        }
    }, { passive: false });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (isScrolling) return;
        if (document.body.classList.contains('nav-open')) return;

        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            scrollToSection(currentIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scrollToSection(currentIndex - 1);
        }
    });

    // Touch swipe support
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (isScrolling) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > 50) { // Min swipe distance
            if (diff > 0) {
                scrollToSection(currentIndex + 1);
            } else {
                scrollToSection(currentIndex - 1);
            }
        }
    }, { passive: true });

    // ============================================
    // INTERSECTION OBSERVERS
    // ============================================

    // Section visibility
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    sections.forEach(section => sectionObserver.observe(section));

    // Text reveal observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: "0px 0px -80px 0px" });

    document.querySelectorAll('.reveal-text').forEach((el) => {
        const section = el.closest('section');
        const siblings = section.querySelectorAll('.reveal-text');
        const localIndex = Array.from(siblings).indexOf(el);
        el.style.transitionDelay = `${localIndex * 0.15}s`;
        revealObserver.observe(el);
    });

    // ============================================
    // PARALLAX — Mystery Layer
    // ============================================
    const mysteryLayer = document.querySelector('.mystery-layer');
    if (mysteryLayer) {
        window.addEventListener('scroll', () => {
            mysteryLayer.style.transform = `translateY(${window.scrollY * 0.3}px)`;
        });
    }

    // ============================================
    // 3D BOOK COVER TILT
    // ============================================
    const coverSection = document.querySelector('.cover-section');
    const tiltWrappers = document.querySelectorAll('.cover-tilt-wrapper');
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (coverSection && tiltWrappers.length && hasHover) {
        const tiltStates = Array.from(tiltWrappers).map(wrapper => ({
            wrapper,
            img: wrapper.querySelector('.book-cover-img'),
            glow: wrapper.querySelector('.cover-glow'),
            currentX: 0, currentY: 0,
            targetX: 0, targetY: 0,
            raf: null
        }));

        coverSection.addEventListener('mousemove', (e) => {
            tiltStates.forEach(state => {
                const rect = state.wrapper.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const percentX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
                const percentY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

                state.targetY = percentX * 12;
                state.targetX = -percentY * 8;

                if (state.glow) {
                    state.glow.style.left = `${50 + percentX * 30}%`;
                }

                if (!state.raf) {
                    state.raf = requestAnimationFrame(() => animateTilt(state));
                }
            });
        });

        coverSection.addEventListener('mouseleave', () => {
            tiltStates.forEach(state => {
                state.targetX = 0;
                state.targetY = 0;
                if (!state.raf) {
                    state.raf = requestAnimationFrame(() => animateTilt(state));
                }
            });
        });

        function animateTilt(state) {
            const ease = 0.08;
            state.currentX += (state.targetX - state.currentX) * ease;
            state.currentY += (state.targetY - state.currentY) * ease;

            const scale = 1 + (Math.abs(state.targetX) + Math.abs(state.targetY)) * 0.002;
            state.img.style.transform =
                `rotateX(${state.currentX}deg) rotateY(${state.currentY}deg) scale(${scale})`;

            const shadowX = state.currentY * 2;
            const shadowY = -state.currentX * 2;
            const shadowBlur = 40 + (Math.abs(state.currentX) + Math.abs(state.currentY)) * 3;
            state.img.style.boxShadow =
                `${shadowX}px ${shadowY + 20}px ${shadowBlur}px rgba(255, 0, 51, 0.3)`;

            const brightness = 0.95 + (Math.abs(state.currentX) + Math.abs(state.currentY)) * 0.008;
            state.img.style.filter = `brightness(${brightness}) contrast(1.15)`;

            if (Math.abs(state.targetX - state.currentX) > 0.05 ||
                Math.abs(state.targetY - state.currentY) > 0.05) {
                state.raf = requestAnimationFrame(() => animateTilt(state));
            } else {
                state.raf = null;
                if (state.targetX === 0 && state.targetY === 0) {
                    state.img.style.transform = 'none';
                    state.img.style.boxShadow = 'none';
                    state.img.style.filter = 'brightness(0.95) contrast(1.15)';
                }
            }
        }
    }

    // ============================================
    // SMOOTH ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Find the section index and use our scroll engine
                const idx = allSections.indexOf(target);
                if (idx >= 0) {
                    scrollToSection(idx);
                } else {
                    // Footer or non-section — direct scroll
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
            // Close nav if open
            closeNav();
        });
    });

    // ============================================
    // NAVIGATION — HOVER TO OPEN
    // ============================================
    const navToggle = document.querySelector('.nav-toggle');
    const navOverlay = document.querySelector('.nav-overlay');
    const body = document.body;

    if (navToggle && navOverlay) {
        // Open on hover
        navToggle.addEventListener('mouseenter', () => {
            openNav();
        });

        // Also support click for mobile
        navToggle.addEventListener('click', () => {
            if (navOverlay.classList.contains('active')) {
                closeNav();
            } else {
                openNav();
            }
        });

        // Close when mouse leaves the nav overlay
        navOverlay.addEventListener('mouseleave', () => {
            closeNav();
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navOverlay.classList.contains('active')) {
                closeNav();
            }
        });

        // Close when clicking overlay background
        navOverlay.addEventListener('click', (e) => {
            if (e.target === navOverlay) {
                closeNav();
            }
        });
    }

    function openNav() {
        navToggle.classList.add('nav-active');
        navOverlay.classList.add('active');
        body.classList.add('nav-open');
    }

    function closeNav() {
        navToggle.classList.remove('nav-active');
        navOverlay.classList.remove('active');
        body.classList.remove('nav-open');
    }

    // ============================================
    // MAGNETIC BUTTON + DECRYPT
    // ============================================
    const magneticBtn = document.querySelector('.magnetic-button');
    if (magneticBtn) {
        const textSpan = magneticBtn.querySelector('.btn-text');
        const originalText = magneticBtn.dataset.textOriginal;
        const hoverText = magneticBtn.dataset.textHover;
        let decryptInterval = null;

        magneticBtn.addEventListener('mousemove', (e) => {
            const rect = magneticBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            magneticBtn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
        });

        magneticBtn.addEventListener('mouseleave', () => {
            magneticBtn.style.transform = 'translate(0, 0)';
            stopDecrypt();
            textSpan.textContent = originalText;
        });

        magneticBtn.addEventListener('mouseenter', () => {
            let iteration = 0;
            const target = hoverText;
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

            stopDecrypt();

            decryptInterval = setInterval(() => {
                textSpan.innerText = target
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) return target[index];
                        return letters[Math.floor(Math.random() * 26)];
                    })
                    .join("");

                if (iteration >= target.length) stopDecrypt();
                iteration += 1 / 3;
            }, 30);
        });

        function stopDecrypt() {
            clearInterval(decryptInterval);
        }
    }

    // ============================================
    // SCROLL INDICATOR CLICK
    // ============================================
    const scrollContainer = document.querySelector('.scroll-container');
    if (scrollContainer) {
        scrollContainer.addEventListener('click', () => {
            scrollToSection(1);
        });
    }

    // ============================================
    // SLIDE-TO-READ COVERS + AMAZON ZOOM
    // ============================================
    const frontCoverWrapper = document.getElementById('front-cover-wrapper');
    const backCoverWrapper = document.getElementById('back-cover-wrapper');
    const coverStage = document.getElementById('cover-stage');

    if (coverStage) {
        // Front cover click → expand left
        if (frontCoverWrapper) {
            frontCoverWrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                if (coverStage.classList.contains('expand-left')) {
                    coverStage.classList.remove('expand-left');
                } else {
                    coverStage.classList.remove('expand-right');
                    coverStage.classList.add('expand-left');
                }
            });
        }

        // Back cover click → expand right
        if (backCoverWrapper) {
            backCoverWrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                if (coverStage.classList.contains('expand-right')) {
                    coverStage.classList.remove('expand-right');
                } else {
                    coverStage.classList.remove('expand-left');
                    coverStage.classList.add('expand-right');
                }
            });
        }

        // Click outside stage → collapse
        document.addEventListener('click', (e) => {
            if (!coverStage.contains(e.target)) {
                coverStage.classList.remove('expand-left', 'expand-right');
            }
        });

        // ESC → collapse
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                coverStage.classList.remove('expand-left', 'expand-right');
            }
        });

        // Amazon-style zoom on expanded panel images
        const zoomContainers = document.querySelectorAll('.zoom-container');
        const zoomLevel = 1.6;

        zoomContainers.forEach(container => {
            const img = container.querySelector('.cover-expanded-img');
            const result = container.querySelector('.zoom-result');
            const src = container.dataset.src;

            if (!img || !result || !src) return;

            // Preload the full-res image for zoom
            result.style.backgroundImage = `url('${src}')`;

            container.addEventListener('mouseenter', () => {
                container.classList.add('zooming');
            });

            container.addEventListener('mouseleave', () => {
                container.classList.remove('zooming');
            });

            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Percentage position
                const px = x / rect.width;
                const py = y / rect.height;

                // Background size = container size × zoom level
                const bgW = rect.width * zoomLevel;
                const bgH = rect.height * zoomLevel;
                result.style.backgroundSize = `${bgW}px ${bgH}px`;

                // Move background so the hovered point is centered
                const bgX = -(px * bgW - rect.width / 2);
                const bgY = -(py * bgH - rect.height / 2);
                result.style.backgroundPosition = `${bgX}px ${bgY}px`;
            });
        });
    }
});
