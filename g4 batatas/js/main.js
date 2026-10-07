/**
 * G4 BATATAS - SCROLL-DRIVEN PINNED CANVAS HERO & MODULAR SECTIONS
 * Stack: Vanilla ES6+, GSAP ScrollTrigger, HTML5 Canvas
 */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 1. SETUP CANVAS & FRAME SEQUENCER
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const frameCount = 102;
  const images = [];
  const currentFrameState = { index: 0 };

  // Generate frame paths: 000.png to 101.png
  function getFramePath(i) {
    const num = String(i).padStart(3, '0');
    return `assets/frames/gemini_generated_video_6b864665_${num}.png`;
  }

  // Resize canvas for crisp High-DPI rendering and object-fit: cover
  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    drawFrame(Math.round(currentFrameState.index));
  }

  window.addEventListener('resize', resizeCanvas);

  // Render specific frame on canvas with cover scaling
  function drawFrame(idx) {
    if (!ctx || !canvas) return;
    const clampedIndex = Math.max(0, Math.min(frameCount - 1, idx));
    const img = images[clampedIndex] || images[0];

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const canvasAspect = cw / ch;
    const imgAspect = iw / ih;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
      drawWidth = cw;
      drawHeight = cw / imgAspect;
      offsetX = 0;
      offsetY = (ch - drawHeight) / 2;
    } else {
      drawHeight = ch;
      drawWidth = ch * imgAspect;
      offsetX = (cw - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Preload First Frame Immediately for instant Scroll 0% display
  const firstFrame = new Image();
  firstFrame.src = getFramePath(0);
  firstFrame.onload = () => {
    images[0] = firstFrame;
    resizeCanvas();
    drawFrame(0);

    // Subtle fade in of initial Hero logo on Scroll 0%
    gsap.fromTo(
      '#hero-center-logo',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out', delay: 0.1 }
    );
  };

  // Preload remaining frames progressively in background
  for (let i = 1; i < frameCount; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    img.onload = () => {
      images[i] = img;
    };
  }

  // 2. HERO PIN TIMELINE & SCROLL-DRIVEN SEQUENCE
  if (typeof gsap !== 'undefined') {
    const heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero-pin-container',
        start: 'top top',
        end: '+=2400', // Scroll distance for the video frame scrub
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          const targetFrame = Math.min(frameCount - 1, Math.floor(self.progress * (frameCount - 1)));
          currentFrameState.index = targetFrame;
          drawFrame(targetFrame);
        }
      }
    });

    // A. Initial central logo fades out quickly as scroll starts (0% to 15%)
    heroTimeline.to(
      '#hero-center-logo',
      {
        opacity: 0,
        scale: 0.9,
        y: -30,
        ease: 'power1.out',
        duration: 0.15
      },
      0
    );

    // B. Subtle scroll indicator fades out immediately
    heroTimeline.to(
      '#hero-scroll-prompt',
      {
        opacity: 0,
        y: 20,
        ease: 'power1.out',
        duration: 0.1
      },
      0
    );

    // C. Lateral Left Content (Intro / Identity) enters smoothly after movement starts (22% to 45%)
    heroTimeline.fromTo(
      '#hero-left-content',
      { opacity: 0, x: -35 },
      { opacity: 1, x: 0, ease: 'power2.out', duration: 0.22 },
      0.22
    );

    // D. Lateral Right Content (Metrics / Impact) enters smoothly (26% to 50%)
    heroTimeline.fromTo(
      '#hero-right-content',
      { opacity: 0, x: 35 },
      { opacity: 1, x: 0, ease: 'power2.out', duration: 0.22 },
      0.26
    );

    // Hold lateral texts visible until near end of pin, then smooth fade before next section
    heroTimeline.to(
      ['#hero-left-content', '#hero-right-content'],
      { opacity: 0.9, duration: 0.4 },
      0.5
    );
  }

  // 3. NAVBAR SCROLL EFFECT
  const navbar = document.getElementById('main-navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar?.classList.add('bg-[#060e0a]/90', 'backdrop-blur-md', 'py-3', 'border-b', 'border-white/10', 'shadow-xl');
      navbar?.classList.remove('bg-transparent', 'py-5');
    } else {
      navbar?.classList.remove('bg-[#060e0a]/90', 'backdrop-blur-md', 'py-3', 'border-b', 'border-white/10', 'shadow-xl');
      navbar?.classList.add('bg-transparent', 'py-5');
    }
  });

  // 4. ANIMATIONS FOR SUBSEQUENT SECTIONS (REVEAL ON SCROLL)
  if (typeof gsap !== 'undefined') {
    // Section 2: Manifesto & Linha do Tempo
    gsap.fromTo(
      '.manifesto-quote',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#manifesto',
          start: 'top 80%',
        }
      }
    );

    gsap.fromTo(
      '.timeline-card',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#timeline-grid',
          start: 'top 85%',
        }
      }
    );

    // Section 3: Ecossistema Operacional & Beneficiamento (Stagger 0.15s, y: 60px -> 0, power3.out)
    gsap.fromTo(
      '.ecosystem-card',
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#ecossistema',
          start: 'top 75%',
        }
      }
    );

    // Section 3: Stats Bar Animated Numbers (GSAP Counter)
    ScrollTrigger.create({
      trigger: '#stats-counter-bar',
      start: 'top 85%',
      once: true,
      onEnter: () => {
        document.querySelectorAll('.stat-counter').forEach((counter) => {
          const target = parseFloat(counter.getAttribute('data-target')) || 100;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2.4,
            ease: 'power2.out',
            onUpdate: () => {
              counter.textContent = Math.round(obj.val);
            }
          });
        });
      }
    });

    // Section 4: Contato & Rodapé
    gsap.fromTo(
      '.contact-card',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#contato',
          start: 'top 85%',
        }
      }
    );
  }

  // =========================================================================
  // ECOSSISTEMA OPERACIONAL & BENEFICIAMENTO — INTERACTIVE LOGIC
  // =========================================================================

  // A. Web Audio API Subtle Tactile Ping on Hover (Zero External MP3 Dependency)
  let audioCtx = null;
  function playHoverTick() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, audioCtx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // B. VanillaTilt 3D Engine & Interactive Radial Spotlight
  const ecosystemCards = document.querySelectorAll('.ecosystem-card');
  if (typeof VanillaTilt !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
    VanillaTilt.init(document.querySelectorAll('.ecosystem-card[data-tilt]'), {
      max: 12,
      speed: 1000,
      glare: true,
      'max-glare': 0.18,
      scale: 1.015,
      gyroscope: false
    });
  }

  ecosystemCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseenter', () => {
      playHoverTick();
    });
  });

  // C. Card 1: Modal Plantio & Manejo Agrícola
  const modalPlanting = document.getElementById('modal-planting');
  const btnOpenPlanting = document.querySelectorAll('.btn-open-planting-modal');
  btnOpenPlanting.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playHoverTick();
      if (modalPlanting) {
        modalPlanting.classList.add('modal-active');
        document.body.classList.add('overflow-hidden');
      }
    });
  });

  // D. Card 2: Switch Interativo Antes/Depois (Lavagem Bruta vs Padrão Higienizado)
  const btnToggleRaw = document.getElementById('btn-toggle-raw');
  const btnToggleClean = document.getElementById('btn-toggle-clean');
  const imgRaw = document.getElementById('card2-img-raw');
  const washStageText = document.getElementById('wash-stage-text');

  function setWashView(stage) {
    playHoverTick();
    if (stage === 'raw') {
      if (imgRaw) imgRaw.style.opacity = '1';
      if (btnToggleRaw) {
        btnToggleRaw.classList.add('active-wash', 'bg-[#18793b]/40', 'text-[#ffc72c]', 'border-[#ffc72c]/40', 'border');
        btnToggleRaw.classList.remove('text-gray-300');
      }
      if (btnToggleClean) {
        btnToggleClean.classList.remove('active-wash', 'bg-[#18793b]/40', 'text-[#ffc72c]', 'border-[#ffc72c]/40', 'border');
        btnToggleClean.classList.add('text-gray-300');
      }
      if (washStageText) {
        washStageText.textContent = 'Lavagem Bruta: Tubérculos do Campo';
      }
    } else {
      if (imgRaw) imgRaw.style.opacity = '0';
      if (btnToggleClean) {
        btnToggleClean.classList.add('active-wash', 'bg-[#18793b]/40', 'text-[#ffc72c]', 'border-[#ffc72c]/40', 'border');
        btnToggleClean.classList.remove('text-gray-300');
      }
      if (btnToggleRaw) {
        btnToggleRaw.classList.remove('active-wash', 'bg-[#18793b]/40', 'text-[#ffc72c]', 'border-[#ffc72c]/40', 'border');
        btnToggleRaw.classList.add('text-gray-300');
      }
      if (washStageText) {
        washStageText.textContent = 'Padrão Higienizado: Água Tratada';
      }
    }
  }

  if (btnToggleRaw) btnToggleRaw.addEventListener('click', () => setWashView('raw'));
  if (btnToggleClean) btnToggleClean.addEventListener('click', () => setWashView('clean'));

  // Card 2: Modal Galpão Virtual & Processo de Lavagem
  const modalGalpao = document.getElementById('modal-galpao');
  const btnOpenGalpao = document.querySelectorAll('.btn-open-galpao-modal');
  btnOpenGalpao.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playHoverTick();
      if (modalGalpao) {
        modalGalpao.classList.add('modal-active');
        document.body.classList.add('overflow-hidden');
      }
    });
  });

  // E. Card 3: Pills de Calibragem Selecionáveis (Atualização Dinâmica)
  const calibreData = {
    especial: {
      weight: '180g – 320g / tubérculo',
      diam: 'Diâmetro > 60mm',
      desc: 'Casca lisa, formato oval uniforme, padrão exigido por Ceasas classe Especial e grandes redes.',
      badge: 'Padrão: Especial / Ágata'
    },
    medio: {
      weight: '110g – 175g / tubérculo',
      diam: 'Diâmetro 45mm – 60mm',
      desc: 'Excelente relação custo-benefício comercial. Alta rotatividade para varejo e redes de supermercados.',
      badge: 'Padrão: Comercial Médio'
    },
    baby: {
      weight: '40g – 100g / tubérculo',
      diam: 'Diâmetro 30mm – 45mm',
      desc: 'Seleção delicada para conservas gourmet, cozimento rápido, assados rústicos e alta gastronomia.',
      badge: 'Padrão: Batata Baby / Gourmet'
    }
  };

  const calibrePills = document.querySelectorAll('.calibre-pill');
  const calibreWeightVal = document.getElementById('calibre-weight-val');
  const calibreDiamVal = document.getElementById('calibre-diam-val');
  const calibreDescVal = document.getElementById('calibre-desc-val');
  const calibreFooterBadge = document.getElementById('calibre-footer-badge');

  calibrePills.forEach(pill => {
    pill.addEventListener('click', () => {
      playHoverTick();
      const type = pill.getAttribute('data-calibre');
      calibrePills.forEach(p => p.classList.remove('active-pill'));
      pill.classList.add('active-pill');

      const info = calibreData[type];
      if (info) {
        if (calibreWeightVal) calibreWeightVal.textContent = info.weight;
        if (calibreDiamVal) calibreDiamVal.textContent = info.diam;
        if (calibreDescVal) calibreDescVal.textContent = info.desc;
        if (calibreFooterBadge) calibreFooterBadge.textContent = info.badge;
      }
    });
  });

  // F. Card 4: Drawer de Transparência / Acordeão CNPJ
  const btnToggleCnpj = document.getElementById('btn-toggle-cnpj-accordion');
  const cnpjContent = document.getElementById('cnpj-accordion-content');
  const cnpjIcon = document.getElementById('cnpj-accordion-icon');

  if (btnToggleCnpj && cnpjContent) {
    btnToggleCnpj.addEventListener('click', () => {
      playHoverTick();
      const isExpanded = !cnpjContent.classList.contains('hidden');
      if (isExpanded) {
        cnpjContent.classList.add('hidden');
        if (cnpjIcon) cnpjIcon.style.transform = 'rotate(0deg)';
      } else {
        cnpjContent.classList.remove('hidden');
        if (cnpjIcon) cnpjIcon.style.transform = 'rotate(180deg)';
      }
    });
  }

  // G. Fechamento Universal de Modais (Botões, Clique no Backdrop, Tecla ESC)
  const closeButtons = document.querySelectorAll('.btn-close-modal');
  function closeAllModals() {
    document.querySelectorAll('#modal-planting, #modal-galpao').forEach(modal => {
      modal.classList.remove('modal-active');
    });
    document.body.classList.remove('overflow-hidden');
  }

  closeButtons.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  [modalPlanting, modalGalpao].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // 5. COPY CNPJ TO CLIPBOARD WITH TOAST
  const copyCnpjBtn = document.getElementById('copy-cnpj-btn');
  const toastNotice = document.getElementById('toast-notice');

  if (copyCnpjBtn) {
    copyCnpjBtn.addEventListener('click', () => {
      const cnpj = '42.277.503/0001-59';
      navigator.clipboard.writeText(cnpj).then(() => {
        showToast('CNPJ 42.277.503/0001-59 copiado com sucesso!');
      }).catch(() => {
        showToast('CNPJ: 42.277.503/0001-59');
      });
    });
  }

  function showToast(message) {
    if (!toastNotice) return;
    const toastText = document.getElementById('toast-text');
    if (toastText) toastText.textContent = message;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 3200);
  }

  // 6. MOBILE MENU TOGGLE
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      } else {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      });
    });
  }

  // 7. INITIALIZE LUCIDE ICONS
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
