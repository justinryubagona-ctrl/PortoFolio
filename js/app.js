/**
 * Justin Vance — Principal Digital Product Designer Portfolio
 * Core Interactive Architecture & Engine
 */

(function () {
  'use strict';

  // State Management
  const state = {
    audioEnabled: false,
    activeTheme: 'default',
    playgroundTokens: {
      accent: '#dfa767',
      radius: 16,
      blur: 16,
      glow: true,
    },
    estimator: {
      baseCost: 16000,
      baseWeeks: 6,
      scaleMult: 1.35,
      speedMult: 1.0,
      addonsCost: 0,
      scopeTitle: 'SaaS Web Application',
    },
    currentTestimonialIndex: 0,
    testimonials: [
      {
        quote: "Justin completely transformed our wealth platform. In just 8 weeks, he took our dense financial tools and turned them into a stunning, intuitive experience that drove a 68% boost in user velocity and helped us close our $30M Series B.",
        name: "Alexander Reynolds",
        role: "VP of Product, Kronos Capital",
        avatar: "AR"
      },
      {
        quote: "Working with Justin was like having an entire world-class design studio compressed into one hyper-talented individual. His grasp of node-graph UX and generative canvas interaction made Synapse AI an immediate industry benchmark.",
        name: "Elena Rostova",
        role: "Co-Founder & Chief Creative Officer, Synapse AI",
        avatar: "ER"
      },
      {
        quote: "The 3D spatial configurator Justin architected for Aura broke every e-commerce conversion record we had. Our customer dwell time shot up 142%, and returns dropped drastically. An absolute master of digital product craft.",
        name: "Marcus Vance",
        role: "Head of Digital Experience, Aura Spatial Studio",
        avatar: "MV"
      }
    ]
  };

  /* ==========================================================================
     01. WEB AUDIO API SYNTHESIZER (Tactile sound feedback, zero external assets)
     ========================================================================== */
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gain = 0.06) {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  function playClick() { playTone(880, 'sine', 0.04, 0.04); }
  function playHover() { playTone(1200, 'sine', 0.02, 0.015); }
  function playSuccess() {
    playTone(523.25, 'triangle', 0.1, 0.06);
    setTimeout(() => playTone(659.25, 'triangle', 0.12, 0.06), 80);
    setTimeout(() => playTone(783.99, 'triangle', 0.18, 0.07), 160);
  }

  // Audio Toggle UI
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      state.audioEnabled = !state.audioEnabled;
      initAudio();
      if (state.audioEnabled) {
        playTone(600, 'sine', 0.1, 0.05);
        toast('Tactile UI sounds enabled');
        audioIcon.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        `;
        audioToggleBtn.style.color = 'var(--accent-gold)';
      } else {
        toast('UI sounds muted');
        audioIcon.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        `;
        audioToggleBtn.style.color = 'var(--text-secondary)';
      }
    });
  }

  /* ==========================================================================
     02. CUSTOM MAGNETIC CURSOR
     ========================================================================== */
  const cursorOuter = document.getElementById('cursorOuter');
  const cursorDot = document.getElementById('cursorDot');

  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;

  if (cursorOuter && cursorDot) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function renderCursor() {
      // Smooth lerp
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;

      cursorOuter.style.left = `${cursorX}px`;
      cursorOuter.style.top = `${cursorY}px`;

      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover state over interactive targets
    const interactives = 'a, button, input, select, textarea, .glass-badge, .project-feature, .service-card, .estimate-chip, .archive-row';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactives)) {
        cursorOuter.classList.add('hovered');
        playHover();
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactives)) {
        cursorOuter.classList.remove('hovered');
      }
    });

    document.addEventListener('mousedown', () => {
      cursorOuter.style.transform = 'translate(-50%, -50%) scale(0.85)';
      playClick();
    });

    document.addEventListener('mouseup', () => {
      cursorOuter.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  }

  /* ==========================================================================
     03. AMBIENT GENERATIVE HERO CANVAS (Digital Sculpture replacing person)
     ========================================================================== */
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    const particleCount = 65;
    let canvasMouse = { x: null, y: null, radius: 180 };

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
      canvasMouse.x = e.clientX;
      canvasMouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      canvasMouse.x = null;
      canvasMouse.y = null;
    });

    // Particle Object
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2.2 + 0.8;
        this.speedX = (Math.random() - 0.5) * 0.45;
        this.speedY = (Math.random() - 0.5) * 0.45;
        this.color = Math.random() > 0.6 ? '#dfa767' : 'rgba(245, 239, 230, 0.45)';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around bounds
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse reaction (organic push)
        if (canvasMouse.x !== null) {
          const dx = canvasMouse.x - this.x;
          const dy = canvasMouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < canvasMouse.radius) {
            const force = (canvasMouse.radius - distance) / canvasMouse.radius;
            const directionX = dx / distance;
            const directionY = dy / distance;
            this.x -= directionX * force * 3;
            this.y -= directionY * force * 3;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      // Don't waste compute if user prefers reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles with subtle glowing lines
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 140) {
            const opacity = (1 - distance / 140) * 0.18;
            ctx.strokeStyle = `rgba(223, 167, 103, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update each particle
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ==========================================================================
     04. WORLD CLOCKS & LIVE TIME UPDATE
     ========================================================================== */
  function updateClocks() {
    const now = new Date();
    
    // Header clock: UTC format
    const headerClock = document.getElementById('headerClock');
    if (headerClock) {
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      headerClock.textContent = `${hours}:${minutes}:${seconds} UTC`;
    }

    // Helper for timezone string
    const formatTime = (timeZone) => {
      return now.toLocaleTimeString('en-US', {
        timeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const clockSF = document.getElementById('clockSF');
    const clockNYC = document.getElementById('clockNYC');
    const clockLDN = document.getElementById('clockLDN');
    const clockTYO = document.getElementById('clockTYO');

    if (clockSF) clockSF.textContent = `${formatTime('America/Los_Angeles')} PST`;
    if (clockNYC) clockNYC.textContent = `${formatTime('America/New_York')} EST`;
    if (clockLDN) clockLDN.textContent = `${formatTime('Europe/London')} GMT`;
    if (clockTYO) clockTYO.textContent = `${formatTime('Asia/Tokyo')} JST`;
  }
  updateClocks();
  setInterval(updateClocks, 1000);

  /* ==========================================================================
     05. STICKY HEADER & SCROLL SPY FOR FLOATING DOCK
     ========================================================================== */
  const topHeader = document.getElementById('topHeader');
  const dockLinks = document.querySelectorAll('[data-dock-link]');
  const sections = ['works', 'services', 'playground', 'process', 'estimator'];

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Header blurred background on scroll
    if (scrollPos > 60) {
      topHeader.classList.add('scrolled');
    } else {
      topHeader.classList.remove('scrolled');
    }

    // Scroll spy for dock
    let currentActive = 'works';
    sections.forEach((secId) => {
      const el = document.getElementById(secId);
      if (el) {
        const top = el.offsetTop - 240;
        if (scrollPos >= top) {
          currentActive = secId;
        }
      }
    });

    dockLinks.forEach((link) => {
      if (link.dataset.dockLink === currentActive) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });

  /* ==========================================================================
     06. EMAIL COPY BUTTON WITH TOAST
     ========================================================================== */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('justin.vance.design@gmail.com').then(() => {
        toast('Email copied to clipboard! (justin.vance.design@gmail.com)');
        playSuccess();
      }).catch(() => {
        window.location.href = 'mailto:justin.vance.design@gmail.com';
      });
    });
  }

  /* ==========================================================================
     07. MOBILE NAVIGATION DRAWER
     ========================================================================== */
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('[data-mobile-link]');

  function toggleMobileNav() {
    const isOpen = mobileDrawer.classList.toggle('open');
    mobileNavToggle.classList.toggle('active', isOpen);
    mobileNavToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  window.closeMobileNav = function () {
    mobileDrawer.classList.remove('open');
    mobileNavToggle.classList.remove('active');
    mobileNavToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', toggleMobileNav);
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      window.closeMobileNav();
    });
  });

  /* ==========================================================================
     08. PROJECT CATEGORY FILTERING
     ========================================================================== */
  const filterPills = document.querySelectorAll('.filter-pill');
  const projectCards = document.querySelectorAll('.project-feature');

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      playClick();

      const filterVal = pill.dataset.filter;

      projectCards.forEach((card) => {
        const category = card.dataset.category;
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'grid';
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ==========================================================================
     09. INTERACTIVE DESIGN LAB & PLAYGROUND
     ========================================================================== */
  const themeSwatches = document.querySelectorAll('[data-playground-theme]');
  const radiusSlider = document.getElementById('radiusSlider');
  const blurSlider = document.getElementById('blurSlider');
  const toggleGlowBtn = document.getElementById('toggleGlowBtn');
  const resetTokensBtn = document.getElementById('resetTokensBtn');

  const radiusValDisplay = document.getElementById('radiusValDisplay');
  const blurValDisplay = document.getElementById('blurValDisplay');
  const glowValDisplay = document.getElementById('glowValDisplay');
  const accentLabel = document.getElementById('accentLabel');
  const stageCard = document.getElementById('stageCard');

  // Theme Accent Switching
  themeSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      themeSwatches.forEach((s) => s.classList.remove('active'));
      swatch.classList.add('active');

      const theme = swatch.dataset.playgroundTheme;
      if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
        accentLabel.textContent = 'Warm Amber (#dfa767)';
      } else if (theme === 'cyber') {
        document.documentElement.setAttribute('data-theme', 'cyber');
        accentLabel.textContent = 'Sky Cyan (#38bdf8)';
      } else if (theme === 'emerald') {
        document.documentElement.setAttribute('data-theme', 'emerald');
        accentLabel.textContent = 'Sage Emerald (#34d399)';
      }
      playClick();
      toast(`Theme token mutated to: ${theme.toUpperCase()}`);
    });
  });

  // Cycle Theme from Header Button
  const themeCycleBtn = document.getElementById('themeCycleBtn');
  if (themeCycleBtn) {
    const themes = ['default', 'cyber', 'emerald'];
    let themeIndex = 0;
    themeCycleBtn.addEventListener('click', () => {
      themeIndex = (themeIndex + 1) % themes.length;
      const theme = themes[themeIndex];

      const matchingSwatch = document.querySelector(`[data-playground-theme="${theme}"]`);
      if (matchingSwatch) {
        matchingSwatch.click();
      }
    });
  }

  // Border Radius Slider
  if (radiusSlider && stageCard) {
    radiusSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      radiusValDisplay.textContent = `${val}px`;
      stageCard.style.setProperty('--sample-radius', `${val}px`);
    });
  }

  // Blur Slider
  if (blurSlider && stageCard) {
    blurSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      blurValDisplay.textContent = `${val}px`;
      stageCard.style.setProperty('--sample-blur', `${val}px`);
    });
  }

  // Toggle Glow Effect
  if (toggleGlowBtn && stageCard) {
    let glowOn = true;
    toggleGlowBtn.addEventListener('click', () => {
      glowOn = !glowOn;
      if (glowOn) {
        stageCard.style.boxShadow = 'var(--shadow-lg), var(--shadow-glow)';
        glowValDisplay.textContent = 'Active';
        toast('Component elevation glow activated');
      } else {
        stageCard.style.boxShadow = 'var(--shadow-lg)';
        glowValDisplay.textContent = 'Disabled';
        toast('Component elevation glow deactivated');
      }
      playClick();
    });
  }

  // Reset Tokens
  if (resetTokensBtn) {
    resetTokensBtn.addEventListener('click', () => {
      radiusSlider.value = 16;
      blurSlider.value = 16;
      radiusValDisplay.textContent = '16px';
      blurValDisplay.textContent = '16px';
      stageCard.style.setProperty('--sample-radius', '16px');
      stageCard.style.setProperty('--sample-blur', '16px');
      document.querySelector('[data-playground-theme="default"]').click();
      toast('Design tokens restored to default baseline');
      playSuccess();
    });
  }

  /* ==========================================================================
     10. TESTIMONIALS CAROUSEL
     ========================================================================== */
  const testimonialQuote = document.getElementById('testimonialQuote');
  const testimonialName = document.getElementById('testimonialName');
  const testimonialRole = document.getElementById('testimonialRole');
  const testimonialAvatar = document.getElementById('testimonialAvatar');
  const prevTestimonialBtn = document.getElementById('prevTestimonialBtn');
  const nextTestimonialBtn = document.getElementById('nextTestimonialBtn');

  function renderTestimonial(index) {
    const item = state.testimonials[index];
    if (!testimonialQuote) return;

    testimonialQuote.style.opacity = '0';
    testimonialQuote.style.transform = 'translateY(8px)';

    setTimeout(() => {
      testimonialQuote.textContent = item.quote;
      testimonialName.textContent = item.name;
      testimonialRole.textContent = item.role;
      testimonialAvatar.textContent = item.avatar;

      testimonialQuote.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      testimonialQuote.style.opacity = '1';
      testimonialQuote.style.transform = 'translateY(0)';
    }, 150);
  }

  if (prevTestimonialBtn && nextTestimonialBtn) {
    prevTestimonialBtn.addEventListener('click', () => {
      state.currentTestimonialIndex = (state.currentTestimonialIndex - 1 + state.testimonials.length) % state.testimonials.length;
      renderTestimonial(state.currentTestimonialIndex);
      playClick();
    });

    nextTestimonialBtn.addEventListener('click', () => {
      state.currentTestimonialIndex = (state.currentTestimonialIndex + 1) % state.testimonials.length;
      renderTestimonial(state.currentTestimonialIndex);
      playClick();
    });
  }

  /* ==========================================================================
     11. INTERACTIVE PROJECT ESTIMATOR
     ========================================================================== */
  const estPriceDisplay = document.getElementById('estPriceDisplay');
  const estTimeDisplay = document.getElementById('estTimeDisplay');
  const inquireConfigBtn = document.getElementById('inquireConfigBtn');

  function calculateEstimate() {
    const totalCost = (state.estimator.baseCost * state.estimator.scaleMult * state.estimator.speedMult) + state.estimator.addonsCost;
    const minCost = Math.round(totalCost * 0.95 / 500) * 500;
    const maxCost = Math.round(totalCost * 1.15 / 500) * 500;

    const baseWeeks = state.estimator.baseWeeks;
    const speedAdjusted = state.estimator.speedMult > 1.1 ? Math.max(3, baseWeeks - 2) : baseWeeks;

    if (estPriceDisplay) {
      estPriceDisplay.textContent = `$${minCost.toLocaleString()} – $${maxCost.toLocaleString()}`;
    }
    if (estTimeDisplay) {
      estTimeDisplay.textContent = `Estimated Timeline: ${speedAdjusted}–${speedAdjusted + 2} Weeks`;
    }
  }

  // Handle Chips
  document.querySelectorAll('.estimate-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const type = chip.dataset.type;

      if (type === 'scope') {
        document.querySelectorAll('[data-type="scope"]').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        state.estimator.baseCost = parseFloat(chip.dataset.cost);
        state.estimator.baseWeeks = parseInt(chip.dataset.time, 10);
        state.estimator.scopeTitle = chip.textContent.trim();
      } else if (type === 'scale') {
        document.querySelectorAll('[data-type="scale"]').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        state.estimator.scaleMult = parseFloat(chip.dataset.mult);
      } else if (type === 'speed') {
        document.querySelectorAll('[data-type="speed"]').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        state.estimator.speedMult = parseFloat(chip.dataset.mult);
      } else if (type === 'addon') {
        chip.classList.toggle('active');
        let addonsTotal = 0;
        document.querySelectorAll('[data-type="addon"].active').forEach((activeAddon) => {
          addonsTotal += parseFloat(activeAddon.dataset.cost);
        });
        state.estimator.addonsCost = addonsTotal;
      }

      playClick();
      calculateEstimate();
    });
  });

  // Transfer Estimator Configuration to Contact Form
  if (inquireConfigBtn) {
    inquireConfigBtn.addEventListener('click', () => {
      const priceText = estPriceDisplay ? estPriceDisplay.textContent : '';
      const timeText = estTimeDisplay ? estTimeDisplay.textContent : '';

      const contactScope = document.getElementById('contactScope');
      const contactMessage = document.getElementById('contactMessage');

      if (contactScope) {
        if (state.estimator.scopeTitle.includes('SaaS')) contactScope.value = 'saas';
        else if (state.estimator.scopeTitle.includes('Brand')) contactScope.value = 'brand';
        else if (state.estimator.scopeTitle.includes('Design System')) contactScope.value = 'design-system';
      }

      if (contactMessage) {
        contactMessage.value = `Hi Justin,\n\nI calculated a project scope using your interactive estimator:\n• Scope: ${state.estimator.scopeTitle}\n• Estimate: ${priceText} (${timeText})\n\nWe'd love to discuss getting started for Q2/Q3 2026.`;
      }

      window.openContactModal();
      toast('Estimator configuration loaded into inquiry form');
    });
  }

  /* ==========================================================================
     12. FAQ ACCORDION
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    const body = item.querySelector('.faq-body');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close other items
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-body').style.maxHeight = null;
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        body.style.maxHeight = null;
      } else {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        body.style.maxHeight = body.scrollHeight + 'px';
      }

      playClick();
    });
  });

  /* ==========================================================================
     13. CONTACT FORM VALIDATION & SUBMISSION
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const submitBtnText = document.getElementById('submitBtnText');
  const submitSpinner = document.getElementById('submitSpinner');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const messageInput = document.getElementById('contactMessage');

      const groupName = document.getElementById('groupName');
      const groupEmail = document.getElementById('groupEmail');
      const groupMessage = document.getElementById('groupMessage');

      // Validate Name
      if (!nameInput.value.trim()) {
        groupName.classList.add('has-error');
        isValid = false;
      } else {
        groupName.classList.remove('has-error');
      }

      // Validate Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        groupEmail.classList.add('has-error');
        isValid = false;
      } else {
        groupEmail.classList.remove('has-error');
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        groupMessage.classList.add('has-error');
        isValid = false;
      } else {
        groupMessage.classList.remove('has-error');
      }

      if (!isValid) {
        playTone(300, 'sawtooth', 0.15, 0.05);
        toast('Please fill in all required fields accurately.', 4000);
        return;
      }

      // Simulate sending
      submitBtnText.style.display = 'none';
      submitSpinner.style.display = 'inline-block';

      setTimeout(() => {
        submitBtnText.style.display = 'inline-block';
        submitSpinner.style.display = 'none';
        contactForm.reset();
        playSuccess();
        toast('Inquiry dispatched successfully! Justin will reply within 4 hours.');
        if (caseStudyModal.classList.contains('open')) {
          closeModal();
        }
      }, 1200);
    });
  }

  /* ==========================================================================
     14. CASE STUDY DETAIL MODAL & PROTOTYPE SIMULATOR
     ========================================================================== */
  const caseStudyModal = document.getElementById('caseStudyModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalDynamicContent = document.getElementById('modalDynamicContent');

  const caseStudiesData = {
    kronos: {
      title: "Kronos Financial Ecosystem",
      subtitle: "Enterprise Wealth Management Architecture",
      year: "2025 — 2026",
      stats: [
        { val: "+$42.8M", lbl: "New Capital Flow" },
        { val: "+68%", lbl: "Task Velocity" },
        { val: "4.9 / 5", lbl: "CSAT Rating" }
      ],
      img: "assets/images/kronos.jpg",
      challenge: "Legacy tabular wealth management software created severe latency for high-net-worth portfolio advisors. Data was siloed across multiple legacy enterprise databases, causing advisors to spend 45+ minutes piecing together client holdings before meetings.",
      solution: "Engineered a single-pane-of-glass dashboard featuring real-time predictive yield curves, instant rebalancing simulators, and a high-contrast dark visual system built to meet WCAG 2.2 AAA accessibility requirements.",
      tags: ["Fintech SaaS", "Design System", "Information Architecture", "TypeScript", "Performance"]
    },
    synapse: {
      title: "Synapse AI Creative Studio",
      subtitle: "Multi-Modal Generative Node Graph",
      year: "2025",
      stats: [
        { val: "850k+", lbl: "Active Pro Creators" },
        { val: "< 16ms", lbl: "Canvas Frame Render" },
        { val: "Awwwards", lbl: "Site of the Day" }
      ],
      img: "assets/images/synapse.jpg",
      challenge: "Traditional linear prompt-and-wait interfaces restricted artists from executing iterative creative workflows. Creators needed a visual, non-destructive way to chain multimodal models (Flux, Stable Diffusion, LLMs) together seamlessly.",
      solution: "Architected an infinite-canvas node-graph engine with dynamic bezier routing, live prompt token heatmaps, and a real-time timeline compositing tray that reduced iteration cycles from minutes to seconds.",
      tags: ["Generative AI UX", "WebGL Shaders", "Infinite Canvas", "Framer", "Awwwards"]
    },
    aura: {
      title: "Aura 3D Spatial Commerce",
      subtitle: "Ultra-Luxury Photorealistic Configurator",
      year: "2024 — 2025",
      stats: [
        { val: "+142%", lbl: "Dwell Time Uplift" },
        { val: "-38%", lbl: "Return Rate Reduction" },
        { val: "FWA", lbl: "Site of the Month" }
      ],
      img: "assets/images/aura.jpg",
      challenge: "High-end bespoke architectural furniture purchases face substantial hesitance online due to customers' inability to inspect material textures, realistic studio lighting, and spatial scale.",
      solution: "Created an in-browser WebGL 3D configurator with physical material shaders (PBR), realistic leather grain micro-bump maps, live dimension calipers, and instant WebXR augmented reality projection without app downloads.",
      tags: ["Three.js", "Spatial Computing", "Luxury E-Commerce", "PBR Shaders", "WebXR"]
    },
    nucleus: {
      title: "Nucleus Enterprise Design System",
      subtitle: "Multi-Brand Semantic Token Pipeline",
      year: "2024",
      stats: [
        { val: "420+", lbl: "Accessible Components" },
        { val: "18", lbl: "Eng Teams Unified" },
        { val: "-64%", lbl: "Dev Handoff Latency" }
      ],
      img: "assets/images/nucleus.jpg",
      challenge: "Three acquired software brands suffered from inconsistent UI components, fractured styling, and duplicate engineering efforts across React web, iOS SwiftUI, and Android Jetpack Compose.",
      solution: "Established a central design token repository using Style Dictionary and Figma Variables. Built 420+ accessible component primitives with automated CI/CD linting that synchronizes Figma updates directly to code repos.",
      tags: ["Design Tokens", "Multi-Brand", "WCAG 2.2 AAA", "Figma Variables", "Storybook"]
    }
  };

  window.openCaseStudy = function (projectId) {
    const data = caseStudiesData[projectId];
    if (!data) return;

    modalDynamicContent.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <span class="section-tag">${data.year} // ${data.subtitle}</span>
        <h2 style="font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; margin-bottom: 0.5rem; color: var(--text-hero);">
          ${data.title}
        </h2>
      </div>

      <div style="border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 2.5rem; border: 1px solid var(--border-medium);">
        <img src="${data.img}" alt="${data.title}" style="width: 100%; max-height: 480px; object-fit: cover;">
      </div>

      <div class="project-metrics-strip" style="margin-bottom: 2.5rem; grid-template-columns: repeat(3, 1fr);">
        ${data.stats.map(s => `
          <div>
            <div class="metric-box-val">${s.val}</div>
            <div class="metric-box-lbl">${s.lbl}</div>
          </div>
        `).join('')}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; margin-bottom: 2.5rem;">
        <div>
          <h4 style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-gold); text-transform: uppercase; margin-bottom: 0.75rem;">The Challenge</h4>
          <p style="font-size: 1rem; line-height: 1.7; color: var(--text-secondary);">${data.challenge}</p>
        </div>
        <div>
          <h4 style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-gold); text-transform: uppercase; margin-bottom: 0.75rem;">The Architectural Solution</h4>
          <p style="font-size: 1rem; line-height: 1.7; color: var(--text-secondary);">${data.solution}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 1rem;">
        <div class="tech-chips" style="margin-bottom: 0;">
          ${data.tags.map(t => `<span class="tech-chip">${t}</span>`).join('')}
        </div>
        <button class="btn btn-gold" onclick="closeModal(); openContactModal();">
          Discuss Similar Project ↗
        </button>
      </div>
    `;

    caseStudyModal.classList.add('open');
    caseStudyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    playClick();
  };

  function closeModal() {
    caseStudyModal.classList.remove('open');
    caseStudyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (caseStudyModal) {
    caseStudyModal.addEventListener('click', (e) => {
      if (e.target === caseStudyModal) {
        closeModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseStudyModal.classList.contains('open')) {
      closeModal();
    }
  });

  // Open Contact Modal helper
  window.openContactModal = function () {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      const nameInput = document.getElementById('contactName');
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 600);
      }
    }
    playClick();
  };

  // Simulate Live Demo Toast
  window.simulateLiveDemo = function (demoName) {
    toast(`Launching interactive sandbox: ${demoName}...`);
    playTone(1000, 'sine', 0.1, 0.04);
  };

  /* ==========================================================================
     15. TOAST NOTIFICATION UTILITY
     ========================================================================== */
  const toastContainer = document.getElementById('toastContainer');

  window.toast = function (msg, duration = 3200) {
    if (!toastContainer) return;

    const toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.innerHTML = `
      <span style="color: var(--accent-gold); font-size: 1rem;">✦</span>
      <span>${msg}</span>
    `;

    toastContainer.appendChild(toastEl);

    // Trigger animation
    requestAnimationFrame(() => {
      toastEl.classList.add('show');
    });

    setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 400);
    }, duration);
  };

  // Initialize baseline estimate
  calculateEstimate();

  console.log("%c Crafted by Justin Vance // Principal Digital Product Designer %c https://justinvance.design ", "background: #dfa767; color: #090a0d; font-weight: bold; padding: 4px 8px; border-radius: 4px;", "background: #111318; color: #f5efe6; padding: 4px 8px;");
})();
