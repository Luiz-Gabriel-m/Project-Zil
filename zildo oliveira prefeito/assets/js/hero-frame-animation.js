/**
 * HERO FRAME ANIMATION - Componente de Animação Baseada em Frames por Scroll
 * Versão Produção - Canvas HTML5, Preload Inteligente, Responsividade 16:9 / 9:16 e GSAP ScrollTrigger
 * 
 * Estrutura:
 * HeroFrameAnimation
 * ├── preloadFrames()
 * ├── resizeCanvas()
 * ├── drawFrame()
 * ├── updateFrameFromScroll()
 * ├── handleResize()
 * └── cleanup()
 */

class HeroFrameAnimation {
  /**
   * @param {Object} options
   * @param {string|HTMLCanvasElement} options.canvas - Seletor ou elemento do Canvas
   * @param {string|HTMLElement} options.container - Container da Hero que será fixado (pin)
   * @param {number} [options.totalFrames=120] - Total de frames extraídos do vídeo
   * @param {string} [options.desktopPath='./assets/hero_frames/desktop/'] - Caminho dos frames 16:9
   * @param {string} [options.mobilePath='./assets/hero_frames/mobile/'] - Caminho dos frames 9:16
   * @param {string} [options.filePrefix='frame_'] - Prefixo dos arquivos (ex: frame_0001.webp)
   * @param {string} [options.fileExt='.webp'] - Extensão dos arquivos
   * @param {number} [options.mobileBreakpoint=768] - Largura máxima em px considerada mobile
   * @param {string} [options.scrollDistance='+=180%'] - Extensão do scroll da animação (tempo de pin)
   * @param {Function} [options.onLoadProgress] - Callback (progress 0-1, loadedCount, total)
   * @param {Function} [options.onFirstFrameLoaded] - Callback ao carregar o primeiro frame
   * @param {Function} [options.onFrameUpdate] - Callback ao desenhar um frame (index, progress)
   */
  constructor(options = {}) {
    this.canvas = typeof options.canvas === 'string' ? document.querySelector(options.canvas) : options.canvas;
    this.container = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;

    if (!this.canvas) {
      console.error('[HeroFrameAnimation] Canvas não encontrado:', options.canvas);
      return;
    }

    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.totalFrames = options.totalFrames || 240;
    this.desktopPath = options.desktopPath || './assets/hero_frames/desktop/';
    this.mobilePath = options.mobilePath || './assets/hero_frames/mobile/';
    this.filePrefix = options.filePrefix || 'frame_';
    this.fileExt = options.fileExt || '.jpg';
    this.digits = options.digits || 3;
    this.mobileBreakpoint = options.mobileBreakpoint || 768;
    this.scrollDistance = options.scrollDistance || '+=200%';

    // Callbacks
    this.onLoadProgress = options.onLoadProgress || null;
    this.onFirstFrameLoaded = options.onFirstFrameLoaded || null;
    this.onFrameUpdate = options.onFrameUpdate || null;

    // Estado interno
    this.currentMode = null; // 'desktop' | 'mobile'
    this.framesCache = { desktop: [], mobile: [] };
    this.currentFrameIndex = 0;
    this.targetFrameIndex = 0;
    this.isReducedMotion = false;
    this.isVisible = true;
    this.isDestroyed = false;
    this.rafId = null;
    this.scrollTriggerInstance = null;
    this.intersectionObserver = null;

    // Debounce resize
    this._onResize = this._onResize.bind(this);
    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    this._renderLoop = this._renderLoop.bind(this);

    this.init();
  }

  /**
   * Retorna o nome do arquivo formatado de acordo com os dígitos e extensão
   * @param {number} index - Índice do frame (0 baseado)
   * @returns {string} Ex: frame_001.jpg
   */
  getFrameFilename(index) {
    const frameNum = String(index + 1).padStart(this.digits, '0');
    return `${this.filePrefix}${frameNum}${this.fileExt}`;
  }

  /**
   * Inicializa o componente, detecta dispositivos e configura listeners
   */
  init() {
    this.checkReducedMotion();
    this.currentMode = this.detectMode();

    // 1. Redimensiona o canvas imediatamente para evitar saltos visuais
    this.resizeCanvas();

    // 2. Pré-carrega os frames do modo atual com prioridade no Frame 1
    this.preloadFrames(this.currentMode);

    // 3. Configura ScrollTrigger ou scroll observer
    if (!this.isReducedMotion) {
      this.setupScrollTrigger();
    }

    // 4. Configura IntersectionObserver para economia de bateria e GPU
    this.setupIntersectionObserver();

    // 5. Adiciona listeners passivos para redimensionamento e rotação
    window.addEventListener('resize', this._onResize, { passive: true });
    window.addEventListener('orientationchange', this._onResize, { passive: true });

    // 6. Inicia o loop de renderização via requestAnimationFrame
    this.rafId = requestAnimationFrame(this._renderLoop);
  }

  /**
   * Detecta se o viewport atual deve usar os frames desktop (16:9) ou mobile (9:16)
   * @returns {'desktop'|'mobile'}
   */
  detectMode() {
    const isMobileWidth = window.innerWidth <= this.mobileBreakpoint;
    const isPortrait = window.innerHeight > window.innerWidth;
    return (isMobileWidth || isPortrait) ? 'mobile' : 'desktop';
  }

  /**
   * Checa preferência do usuário por movimento reduzido (Acessibilidade)
   */
  checkReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = mediaQuery.matches;

    mediaQuery.addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
      if (this.isReducedMotion && this.scrollTriggerInstance) {
        this.scrollTriggerInstance.kill();
        this.drawFrame(0);
      } else if (!this.isReducedMotion && !this.scrollTriggerInstance) {
        this.setupScrollTrigger();
      }
    });
  }

  /**
   * Pré-carrega os frames de forma assíncrona com prioridade no primeiro frame
   * @param {'desktop'|'mobile'} mode
   */
  preloadFrames(mode) {
    if (this.framesCache[mode].length === this.totalFrames) {
      // Já está em cache
      this.drawFrame(this.currentFrameIndex);
      return;
    }

    const basePath = mode === 'mobile' ? this.mobilePath : this.desktopPath;
    const frames = new Array(this.totalFrames);
    let loadedCount = 0;

    // Prioridade 1: Carrega o frame 001 primeiro para exibição instantânea
    const firstImg = new Image();
    firstImg.src = `${basePath}${this.getFrameFilename(0)}`;
    firstImg.onload = () => {
      frames[0] = firstImg;
      loadedCount++;
      if (this.currentMode === mode) {
        this.drawFrame(0);
        if (this.onFirstFrameLoaded) this.onFirstFrameLoaded(firstImg);
      }

      // Prioridade 2: Carrega progressivamente os frames restantes (frame 2 até o total)
      for (let i = 1; i < this.totalFrames; i++) {
        const img = new Image();
        img.src = `${basePath}${this.getFrameFilename(i)}`;

        img.onload = () => {
          frames[i] = img;
          loadedCount++;
          if (this.onLoadProgress) {
            this.onLoadProgress(loadedCount / this.totalFrames, loadedCount, this.totalFrames);
          }
        };

        img.onerror = () => {
          // Fallback gracioso para frame anterior se houver erro
          frames[i] = frames[i - 1] || firstImg;
          loadedCount++;
        };
      }
    };

    firstImg.onerror = () => {
      console.warn(`[HeroFrameAnimation] Não foi possível carregar o primeiro frame em: ${firstImg.src}`);
    };

    this.framesCache[mode] = frames;
  }

  /**
   * Ajusta as dimensões do Canvas respeitando a proporção da tela e DPR controlado
   */
  resizeCanvas() {
    if (!this.canvas || !this.container) return;

    // Limita DPR a no máximo 2 para preservar GPU e bateria
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    // Atribui dimensões físicas ao canvas
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);

    // Ajusta o estilo CSS
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Redesenha o frame atual na nova proporção
    this.drawFrame(this.currentFrameIndex);
  }

  /**
   * Desenha o frame no Canvas aplicando lógica 'object-fit: cover'
   * Centraliza a imagem e preenche todo o container sem deformar o personagem.
   * @param {number} frameIndex - Índice do frame (0 a totalFrames - 1)
   */
  drawFrame(frameIndex) {
    if (!this.ctx || !this.canvas || !this.isVisible) return;

    const frames = this.framesCache[this.currentMode];
    if (!frames || !frames.length) return;

    // Busca o frame exato ou o frame mais próximo carregado para evitar flicker
    let img = frames[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < 10; offset++) {
        const prev = frames[frameIndex - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          img = prev;
          break;
        }
      }
      if (!img || !img.complete) {
        img = frames[0];
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    const imgWidth = img.naturalWidth || (this.currentMode === 'mobile' ? 720 : 1280);
    const imgHeight = img.naturalHeight || (this.currentMode === 'mobile' ? 1280 : 720);

    // Cálculo exato de object-fit: cover sem distorção
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Centraliza o corte
    const dx = (canvasWidth - scaledWidth) / 2;
    const dy = (canvasHeight - scaledHeight) / 2;

    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.ctx.drawImage(img, dx, dy, scaledWidth, scaledHeight);

    this.currentFrameIndex = frameIndex;

    if (this.onFrameUpdate) {
      this.onFrameUpdate(frameIndex, frameIndex / (this.totalFrames - 1));
    }
  }

  /**
   * Atualiza o frame alvo com base no progresso de scroll da Hero
   * @param {number} progress - Progresso de 0.0 a 1.0
   */
  updateFrameFromScroll(progress) {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const targetIndex = Math.min(
      this.totalFrames - 1,
      Math.max(0, Math.floor(clampedProgress * (this.totalFrames - 1)))
    );

    this.targetFrameIndex = targetIndex;
  }

  /**
   * Loop suave sincronizado com o refresh rate via requestAnimationFrame
   */
  _renderLoop() {
    if (this.isDestroyed) return;

    if (this.isVisible && this.currentFrameIndex !== this.targetFrameIndex) {
      this.drawFrame(this.targetFrameIndex);
    }

    this.rafId = requestAnimationFrame(this._renderLoop);
  }

  /**
   * Configura o pinning e o controle de scroll via GSAP ScrollTrigger
   */
  setupScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[HeroFrameAnimation] GSAP ou ScrollTrigger não carregados. Usando scroll nativo.');
      this.setupNativeScroll();
      return;
    }

    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }

    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: this.container,
      start: 'top top',
      end: this.scrollDistance,
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      anticipatePin: 1,
      onUpdate: (self) => {
        this.updateFrameFromScroll(self.progress);
      }
    });
  }

  /**
   * Fallback nativo caso GSAP não esteja presente
   */
  setupNativeScroll() {
    const handleScroll = () => {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = this.container.offsetHeight - windowHeight;

      if (totalScrollable <= 0) return;

      const progress = -rect.top / totalScrollable;
      this.updateFrameFromScroll(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    this._nativeScrollHandler = handleScroll;
  }

  /**
   * Pausa o processamento quando a Hero não estiver visível na viewport
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window) || !this.container) return;

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible) {
          this.drawFrame(this.targetFrameIndex);
        }
      });
    }, {
      root: null,
      threshold: 0.05
    });

    this.intersectionObserver.observe(this.container);
  }

  /**
   * Lida com redimensionamento e rotação da tela
   */
  _onResize() {
    const newMode = this.detectMode();

    if (newMode !== this.currentMode) {
      this.currentMode = newMode;
      this.preloadFrames(newMode);
    }

    this.resizeCanvas();

    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.refresh();
    }
  }

  _onVisibilityChange() {
    this.isVisible = !document.hidden;
  }

  /**
   * Limpeza de memória, remoção de listeners e cancelamento de animação
   */
  cleanup() {
    this.isDestroyed = true;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
      this.scrollTriggerInstance = null;
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    if (this._nativeScrollHandler) {
      window.removeEventListener('scroll', this._nativeScrollHandler);
    }

    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('orientationchange', this._onResize);

    // Limpa cache de imagens
    this.framesCache.desktop = [];
    this.framesCache.mobile = [];

    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Exporta globalmente para uso direto em scripts sem bundler
window.HeroFrameAnimation = HeroFrameAnimation;
