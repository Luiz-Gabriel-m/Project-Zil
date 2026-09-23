/**
 * MAIN.JS - Orquestrador Principal do Site
 * Zildo (Zildinho) Oliveira - Prefeito de Toledo-MG
 * Identidade: Azul Nobre Institucional & Amarelo Tucano (#FACC15 / #EAB308)
 * Animações: Hero Frame-by-Frame Canvas, Zoom B&W de Toledo (Ken Burns Storytelling), Contadores e Modais
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializa Ícones Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Inicializa o Componente HeroFrameAnimation (Canvas 240 frames)
  initHeroFrameAnimation();

  // 3. Registra Plugins GSAP & ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initHeroContentEntrance();
    initCartaAbertaAnimation();
    initCityStorytellingZoom();
    initTimelineAnimation();
    initStatsCounters();
    initProjectsDashboard();
    initGalleryAnimation();
  }

  // 4. Interações de Interface
  initMobileNav();
  initContactModal();
  initSmoothScroll();
});

/* ==========================================================================
   1. INICIALIZAÇÃO DA HERO FRAME ANIMATION (APROVAÇÃO POPULAR)
   ========================================================================== */
function initHeroFrameAnimation() {
  const canvas = document.getElementById('hero-canvas');
  const container = document.getElementById('hero-frame-container');
  const loaderBar = document.getElementById('hero-loader-progress');
  const loaderContainer = document.getElementById('hero-loader-container');
  const scrollHint = document.getElementById('hero-scroll-hint');

  if (!canvas || !container || typeof HeroFrameAnimation === 'undefined') {
    console.warn('[main.js] HeroFrameAnimation ou elementos necessários não encontrados.');
    return;
  }

  window.heroAnimation = new HeroFrameAnimation({
    canvas: canvas,
    container: container,
    totalFrames: 240,
    digits: 3,
    desktopPath: './assets/hero_frames/desktop/',
    mobilePath: './assets/hero_frames/mobile/',
    filePrefix: 'frame_',
    fileExt: '.jpg',
    mobileBreakpoint: 768,
    scrollDistance: '+=200%',

    onLoadProgress: (progress, loaded, total) => {
      if (loaderBar) {
        const pct = Math.round(progress * 100);
        loaderBar.style.width = `${pct}%`;

        if (pct >= 100 && loaderContainer) {
          setTimeout(() => {
            loaderContainer.style.opacity = '0';
          }, 300);
        }
      }
    },

    onFirstFrameLoaded: () => {
      if (loaderContainer) {
        loaderContainer.style.opacity = '1';
      }
    },

    onFrameUpdate: (frameIndex, progress) => {
      if (scrollHint && progress > 0.05) {
        scrollHint.style.opacity = Math.max(0, 1 - (progress - 0.05) * 5);
      } else if (scrollHint && progress <= 0.05) {
        scrollHint.style.opacity = '1';
      }
    }
  });
}

/* ==========================================================================
   2. ENTRADA SUAVE DO CONTEÚDO DA HERO
   ========================================================================== */
function initHeroContentEntrance() {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  const eyebrow = document.getElementById('hero-eyebrow');
  const title = document.getElementById('hero-title');
  const desc = document.getElementById('hero-desc');
  const cta = document.getElementById('hero-cta');
  const hint = document.getElementById('hero-scroll-hint');

  const tl = gsap.timeline({ delay: 0.2 });

  if (eyebrow) {
    tl.fromTo(eyebrow,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }

  if (title) {
    tl.fromTo(title,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.3'
    );
  }

  if (desc) {
    tl.fromTo(desc,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.4'
    );
  }

  if (cta) {
    tl.fromTo(cta,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    );
  }

  if (hint) {
    tl.fromTo(hint,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out' },
      '-=0.2'
    );
  }
}

/* ==========================================================================
   3. CARTA ABERTA AOS TOLEDENSES (AMOR POR TOLEDO, RESPEITO PELO POVO)
   ========================================================================== */
function initCartaAbertaAnimation() {
  const section = document.getElementById('carta-aberta');
  const title = document.getElementById('carta-title');
  const quote = document.getElementById('carta-quote');
  const line = document.getElementById('carta-tucano-line');

  if (!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      end: 'bottom 85%',
      toggleActions: 'play none none reverse'
    }
  });

  if (line) {
    tl.fromTo(line, { width: 0 }, { width: 48, duration: 0.8, ease: 'power3.out' });
  }

  if (title) {
    tl.fromTo(title,
      { opacity: 0, y: 35, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' },
      '-=0.5'
    );
  }

  if (quote) {
    tl.fromTo(quote,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' },
      '-=0.4'
    );
  }
}

/* ==========================================================================
   4. STORYTELLING COM ZOOM B&W DA CIDADE (ESTILO RENAN SANTOS)
   Ken Burns zoom lento na praça e igreja de Toledo com frases por scroll
   ========================================================================== */
function initCityStorytellingZoom() {
  const section = document.getElementById('nossa-cidade');
  const zoomBg = document.getElementById('city-zoom-bg');
  const stepCards = document.querySelectorAll('.city-step-card');
  const stepIndicators = document.querySelectorAll('.story-step-indicator');
  const indicatorLines = document.querySelectorAll('.story-indicator-line');

  if (!section || !zoomBg || !stepCards.length) return;

  // Timeline com pin: fixa a tela por 250% de scroll
  const storyTL = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        // Atualiza indicadores laterais (01, 02, 03)
        let activeIndex = 0;
        if (progress >= 0.64) activeIndex = 2;
        else if (progress >= 0.32) activeIndex = 1;

        stepIndicators.forEach((ind, i) => {
          if (i === activeIndex) {
            ind.classList.add('text-tucano');
            ind.classList.remove('text-zinc-500');
          } else {
            ind.classList.remove('text-tucano');
            ind.classList.add('text-zinc-500');
          }
        });

        indicatorLines.forEach((line, i) => {
          if (i === activeIndex) {
            line.classList.add('active');
          } else {
            line.classList.remove('active');
          }
        });
      }
    }
  });

  // 1. Ken Burns Effect: Zoom contínuo na foto B&W da praça/igreja de Toledo
  storyTL.fromTo(zoomBg,
    { scale: 1.04 },
    { scale: 1.25, ease: 'none', duration: 3 },
    0
  );

  // 2. Transição das 3 Frases de Impacto:
  // Step 1: 0 a 1s
  // Step 2: 1s a 2s
  // Step 3: 2s a 3s

  // Card 1 sai
  if (stepCards[0]) {
    gsap.set(stepCards[0], { opacity: 1, y: 0, visibility: 'visible' });
    storyTL.to(stepCards[0], {
      opacity: 0,
      y: -30,
      ease: 'power2.in',
      duration: 0.4
    }, 0.85);
  }

  // Card 2 entra e sai
  if (stepCards[1]) {
    gsap.set(stepCards[1], { opacity: 0, y: 30, visibility: 'visible' });
    storyTL.to(stepCards[1], {
      opacity: 1,
      y: 0,
      ease: 'power2.out',
      duration: 0.4
    }, 1.05);

    storyTL.to(stepCards[1], {
      opacity: 0,
      y: -30,
      ease: 'power2.in',
      duration: 0.4
    }, 1.85);
  }

  // Card 3 entra e permanece até o fim da seção
  if (stepCards[2]) {
    gsap.set(stepCards[2], { opacity: 0, y: 30, visibility: 'visible' });
    storyTL.to(stepCards[2], {
      opacity: 1,
      y: 0,
      ease: 'power2.out',
      duration: 0.4
    }, 2.05);
  }
}

/* ==========================================================================
   5. LINHA DO TEMPO (TRABALHO PELO POVO)
   ========================================================================== */
function initTimelineAnimation() {
  const timelineBar = document.getElementById('timeline-tucano-progress');
  const timelineBox = document.getElementById('timeline-section');
  const timelineCards = document.querySelectorAll('.history-card');

  if (timelineBox && timelineBar) {
    gsap.fromTo(timelineBar,
      { height: '0%' },
      {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: timelineBox,
          start: 'top 70%',
          end: 'bottom 80%',
          scrub: 0.5
        }
      }
    );
  }

  timelineCards.forEach(card => {
    gsap.fromTo(card,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
}

/* ==========================================================================
   6. CONTADORES NUMÉRICOS (REALIZAÇÕES ENTREGUES)
   ========================================================================== */
function initStatsCounters() {
  const statNumbers = document.querySelectorAll('.stat-tucano-number');

  statNumbers.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-target') || '0');
    const prefix = counter.getAttribute('data-prefix') || '';
    const suffix = counter.getAttribute('data-suffix') || '';

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        let obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            if (target % 1 === 0) {
              counter.innerText = `${prefix}${Math.floor(obj.val).toLocaleString('pt-BR')}${suffix}`;
            } else {
              counter.innerText = `${prefix}${obj.val.toFixed(1).replace('.', ',')}${suffix}`;
            }
          }
        });
      }
    });
  });
}

/* ==========================================================================
   7. MENU MOBILE RESPONSIVO
   ========================================================================== */
function initMobileNav() {
  const btn = document.getElementById('mobile-menu-btn');
  const close = document.getElementById('mobile-menu-close');
  const menu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-link');

  if (!btn || !menu) return;

  function openMenu() {
    menu.classList.remove('hidden');
    gsap.fromTo(menu,
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    gsap.to(menu, {
      opacity: 0,
      y: -10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        menu.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }

  btn.addEventListener('click', openMenu);
  if (close) close.addEventListener('click', closeMenu);
  links.forEach(l => l.addEventListener('click', closeMenu));
}

/* ==========================================================================
   8. MODAL DO CANAL OFICIAL / GABINETE MUNICIPAL
   ========================================================================== */
function initContactModal() {
  const modal = document.getElementById('contact-modal');
  const openBtns = document.querySelectorAll('.open-official-channel');
  const closeBtn = document.getElementById('close-contact-modal');
  const form = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');

  if (!modal) return;

  function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    gsap.fromTo(modal.querySelector('.modal-box'),
      { opacity: 0, scale: 0.94, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
    );
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    gsap.to(modal.querySelector('.modal-box'), {
      opacity: 0,
      scale: 0.95,
      y: 10,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        if (form && success) {
          form.classList.remove('hidden');
          success.classList.add('hidden');
          form.reset();
        }
      }
    });
  }

  openBtns.forEach(b => b.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  }));

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btnSubmit = form.querySelector('button[type="submit"]');
      const oldHtml = btnSubmit.innerHTML;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = 'Enviando...';

      setTimeout(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = oldHtml;
        if (success) {
          form.classList.add('hidden');
          success.classList.remove('hidden');
        }
      }, 1000);
    });
  }
}

/* ==========================================================================
   9. SCROLL SUAVE
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   10. PROJETOS EM ANDAMENTO - BARRAS DE PROGRESSO ANIMADAS
   ========================================================================== */
function initProjectsDashboard() {
  const projectSection = document.getElementById('projetos');
  if (!projectSection) return;

  const progressBars = projectSection.querySelectorAll('.progress-bar-tucano, .progress-bar-green');
  const percentLabels = projectSection.querySelectorAll('.progress-percent');
  const projectCards = projectSection.querySelectorAll('.project-card');

  // Animação de entrada dos cards com stagger
  projectCards.forEach((card, index) => {
    gsap.fromTo(card,
      { opacity: 0, y: 35, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        delay: index * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Barras de progresso animadas ao entrar na viewport
  progressBars.forEach(bar => {
    const targetWidth = bar.getAttribute('data-width') || 0;
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(bar, {
          width: `${targetWidth}%`,
          duration: 1.5,
          ease: 'power2.out',
          delay: 0.3
        });
      }
    });
  });

  // Percentuais animados (0% → XX%)
  percentLabels.forEach(label => {
    const target = parseInt(label.getAttribute('data-target') || '0', 10);
    ScrollTrigger.create({
      trigger: label,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        let obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.5,
          ease: 'power2.out',
          delay: 0.3,
          onUpdate: () => {
            label.innerText = `${Math.floor(obj.val)}%`;
          }
        });
      }
    });
  });
}

/* ==========================================================================
   11. GALERIA DO POVO - ANIMAÇÃO DE ENTRADA DA BENTO GRID
   ========================================================================== */
function initGalleryAnimation() {
  const galleryCards = document.querySelectorAll('.gallery-card');
  if (!galleryCards.length) return;

  galleryCards.forEach((card, index) => {
    gsap.fromTo(card,
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        delay: index * 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
}

