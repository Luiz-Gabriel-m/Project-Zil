# 🎬 Cinematic Hero — Scroll-Driven Frame Animation

Uma landing page moderna e responsiva com uma **Hero Section cinematográfica**, desenvolvida utilizando uma sequência de frames extraídos de vídeo e renderizados em tempo real através do **HTML5 Canvas**.

O projeto explora técnicas de animação web, otimização de assets, responsividade e interação baseada em scroll para criar uma experiência visual imersiva sem depender da reprodução direta de um arquivo de vídeo.

---

## 🚀 Sobre o projeto

O objetivo deste projeto é criar uma experiência de entrada visualmente impactante para uma aplicação ou portfólio, utilizando uma animação frame-by-frame controlada pela navegação do usuário.

Em vez de utilizar um vídeo MP4 tradicional como background, o vídeo original é convertido em uma sequência de imagens WebP.

Esses frames são carregados e renderizados através do Canvas, permitindo que a animação seja sincronizada com o scroll da página.

### Fluxo da animação

```text
Vídeo original
      ↓
Extração dos frames
      ↓
Conversão para WebP
      ↓
Frames Desktop + Mobile
      ↓
Preload das imagens
      ↓
HTML5 Canvas
      ↓
Scroll do usuário
      ↓
Frame correspondente
      ↓
Hero cinematográfica
```

A navegação do usuário determina qual frame deve ser exibido.

Por exemplo:

```text
Scroll 0%
    ↓
Frame 0001

Scroll 25%
    ↓
Frame ~0030

Scroll 50%
    ↓
Frame ~0060

Scroll 75%
    ↓
Frame ~0090

Scroll 100%
    ↓
Frame 0120
```

---

# ✨ Principais características

* 🎬 Hero cinematográfica baseada em frames
* 🖼️ 120 frames por animação
* ⚡ Renderização utilizando HTML5 Canvas
* 🖱️ Animação controlada pelo scroll
* 📱 Layout específico para dispositivos móveis
* 🖥️ Versão otimizada para desktop
* 🧩 Arquitetura baseada em componentes
* 🚀 Preload dos frames
* 📦 Imagens em formato WebP
* 📐 Canvas responsivo
* 🎨 Overlay e conteúdo sobre a animação
* ♿ Suporte a `prefers-reduced-motion`
* 🔥 Experiência visual moderna
* ⚙️ Código preparado para reutilização
* 📱 Compatibilidade com diferentes tamanhos de tela

---

# 🛠️ Tecnologias utilizadas

## Front-end

### HTML5

Utilizado para estruturar a página e os elementos da Hero Section.

Principais recursos:

* HTML semântico
* Canvas API
* estrutura responsiva
* elementos de interação

---

### CSS3

Responsável pelo layout, responsividade e apresentação visual.

Recursos utilizados:

* Flexbox
* CSS Grid
* `clamp()`
* Media Queries
* `100svh`
* posicionamento absoluto
* overlays
* gradientes
* transições
* animações
* responsividade

Exemplo:

```css
.hero-title {
  font-size: clamp(2.5rem, 7vw, 6rem);
}
```

---

### JavaScript

Responsável pelo comportamento da animação e interação com o usuário.

Principais funcionalidades:

* carregamento dos frames
* gerenciamento das imagens
* controle do Canvas
* cálculo do progresso do scroll
* seleção do frame correspondente
* `requestAnimationFrame`
* `IntersectionObserver`
* gerenciamento de resize
* detecção de dispositivo
* controle de performance

---

## 🎨 Canvas API

O HTML5 Canvas é utilizado para renderizar os frames da animação.

Em vez de inserir dezenas ou centenas de imagens diretamente no DOM, o projeto mantém os frames em memória e desenha apenas o frame necessário no Canvas.

```javascript
ctx.drawImage(
  image,
  0,
  0,
  canvas.width,
  canvas.height
);
```

Essa abordagem permite controlar a animação com precisão e evita a criação de uma grande quantidade de elementos HTML.

---

# 🖼️ Sistema de Frames

A animação utiliza **120 frames**.

Cada frame representa uma etapa da animação original.

Estrutura:

```text
hero-frames/
│
├── desktop/
│   ├── frame_0001.webp
│   ├── frame_0002.webp
│   ├── frame_0003.webp
│   ├── ...
│   └── frame_0120.webp
│
└── mobile/
    ├── frame_0001.webp
    ├── frame_0002.webp
    ├── frame_0003.webp
    ├── ...
    └── frame_0120.webp
```

---

# 📱 Responsividade

O projeto possui duas versões dos frames.

## Desktop

Resolução:

```text
1280 × 720
16:9
```

Utilizada em:

* desktops
* notebooks
* monitores maiores
* telas widescreen

---

## Mobile

Resolução:

```text
720 × 1280
9:16
```

Os frames mobile foram preparados especificamente para telas verticais.

Isso evita simplesmente redimensionar ou cortar a versão desktop no celular.

```text
Desktop
┌──────────────────────────────┐
│                              │
│          PERSONAGEM          │
│                              │
└──────────────────────────────┘

Mobile
┌──────────────┐
│              │
│              │
│  PERSONAGEM  │
│              │
│              │
└──────────────┘
```

---

# 🖱️ Scroll-Driven Animation

Um dos principais recursos do projeto é o controle da animação através do scroll.

O progresso da navegação é convertido em um índice de frame.

Conceito:

```javascript
const progress = scrollProgress;

const frameIndex = Math.floor(
  progress * (totalFrames - 1)
);
```

Dessa forma:

```text
0%   → Frame 0001
10%  → Frame 0012
25%  → Frame 0030
50%  → Frame 0060
75%  → Frame 0090
100% → Frame 0120
```

Isso cria uma sensação de que o usuário está controlando diretamente a animação.

---

# ⚡ Performance

Performance é uma das principais preocupações do projeto.

Foram adotadas algumas estratégias para reduzir o impacto da animação.

### WebP

Os frames são armazenados em WebP para reduzir o tamanho dos arquivos sem comprometer significativamente a qualidade visual.

### Preload

Os frames são carregados antecipadamente para evitar travamentos durante a animação.

### Canvas

O Canvas evita a criação de 120 elementos visuais independentes no DOM.

### requestAnimationFrame

A atualização da renderização utiliza:

```javascript
requestAnimationFrame()
```

permitindo que o navegador sincronize a atualização com o ciclo de renderização.

### IntersectionObserver

O processamento pode ser controlado conforme a Hero entra ou sai da área visível.

Isso evita processamento desnecessário quando o usuário já está longe da seção.

### Device Pixel Ratio

O tamanho interno do Canvas pode ser limitado para evitar consumo excessivo de memória em dispositivos de alta densidade.

Exemplo:

```javascript
const dpr = Math.min(
  window.devicePixelRatio,
  2
);
```

---

# ♿ Acessibilidade

O projeto também considera usuários que preferem reduzir animações.

É utilizado:

```css
@media (prefers-reduced-motion: reduce) {
  /* reduz ou desativa animações */
}
```

Quando essa preferência está ativada, a experiência pode utilizar um frame estático em vez da animação baseada em scroll.

---

# 🎨 Estrutura da Hero

A Hero é dividida em camadas:

```text
Hero
│
├── Canvas
│   └── Frame Animation
│
├── Overlay
│   └── Gradiente / contraste
│
└── Content
    ├── Eyebrow
    ├── Heading
    ├── Description
    └── CTA
```

Essa separação permite alterar o conteúdo textual sem interferir na animação.

---

# 📂 Estrutura do projeto

Uma estrutura sugerida:

```text
project/
│
├── public/
│   └── hero-frames/
│       ├── desktop/
│       │   ├── frame_0001.webp
│       │   ├── ...
│       │   └── frame_0120.webp
│       │
│       └── mobile/
│           ├── frame_0001.webp
│           ├── ...
│           └── frame_0120.webp
│
├── src/
│   ├── components/
│   │   └── HeroFrameAnimation/
│   │       ├── HeroFrameAnimation
│   │       ├── hero-frame-animation.css
│   │       └── hero-frame-animation.js
│   │
│   ├── pages/
│   │
│   ├── styles/
│   │
│   └── ...
│
├── README.md
└── package.json
```

A estrutura pode ser adaptada ao framework utilizado no projeto.

---

# 🧩 Componente principal

A lógica da animação deve ser encapsulada em um componente reutilizável:

```text
HeroFrameAnimation
│
├── preloadFrames()
├── resizeCanvas()
├── drawFrame()
├── updateFrameFromScroll()
├── handleResize()
└── cleanup()
```

Isso facilita manutenção e permite utilizar a mesma tecnologia em outras páginas.

---

# 🎯 Objetivos técnicos

Este projeto foi desenvolvido com foco em:

* Experiência do usuário
* Performance
* Responsividade
* Organização de código
* Componentização
* Animação web
* Manipulação de Canvas
* Otimização de imagens
* Interação baseada em scroll
* Acessibilidade
* Reutilização de componentes

---

# 🔄 Fluxo de execução

Ao carregar a página:

```text
1. Página inicia
       ↓
2. Detecta dispositivo
       ↓
3. Seleciona Desktop ou Mobile
       ↓
4. Inicia preload
       ↓
5. Carrega os frames
       ↓
6. Inicializa Canvas
       ↓
7. Renderiza primeiro frame
       ↓
8. Usuário começa a rolar
       ↓
9. Calcula progresso
       ↓
10. Seleciona frame
       ↓
11. Canvas renderiza frame
       ↓
12. Usuário chega ao final
       ↓
13. Frame 0120 permanece exibido
```

---

# 🚀 Possíveis evoluções

O projeto pode evoluir futuramente para incluir:

* Lazy loading dos frames
* Compressão adicional dos assets
* Web Worker para processamento
* WebGL para animações mais pesadas
* GSAP ScrollTrigger
* Transições entre diferentes cenas
* Múltiplas sequências de frames
* Parallax
* Efeitos de partículas
* Interações com mouse
* Animações 3D
* Preloader visual
* Progressive loading
* CDN para os assets
* Cache via Service Worker
* PWA
* Sistema de temas
* Internacionalização

---

# 📊 Comparação da abordagem

### Vídeo tradicional

```text
MP4
 ↓
Browser reproduz vídeo
 ↓
Controle limitado pelo scroll
```

### Frame-by-frame

```text
Frames WebP
 ↓
Canvas
 ↓
Scroll
 ↓
Frame específico
```

A segunda abordagem oferece maior controle sobre a relação entre navegação e animação, sendo especialmente interessante para landing pages e experiências interativas.

---

# 💻 Instalação

Clone o repositório:

```bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
```

Entre na pasta:

```bash
cd SEU-REPOSITORIO
```

Instale as dependências:

```bash
npm install
```

Execute o ambiente de desenvolvimento:

```bash
npm run dev
```

Depois acesse a URL indicada pelo servidor local.

> Os comandos podem variar de acordo com o framework utilizado.

---

# 🔧 Configuração

A quantidade de frames pode ser configurada através de:

```javascript
const totalFrames = 120;
```

A velocidade pode ser ajustada através de:

```javascript
const fps = 12;
```

Os caminhos dos assets podem ser configurados através de:

```javascript
const desktopPath = "/hero-frames/desktop/";
const mobilePath = "/hero-frames/mobile/";
```

---

# 📈 Performance e boas práticas

Durante o desenvolvimento foram consideradas as seguintes práticas:

* Evitar manipulação excessiva do DOM
* Evitar múltiplos listeners desnecessários
* Utilizar `requestAnimationFrame`
* Otimizar imagens
* Separar assets desktop/mobile
* Controlar resolução do Canvas
* Utilizar carregamento antecipado
* Reduzir processamento fora da viewport
* Respeitar acessibilidade
* Manter a lógica da animação isolada

---

# 👨‍💻 Desenvolvimento

Projeto desenvolvido como estudo e aplicação prática de conceitos modernos de desenvolvimento Front-End, com foco em:

**JavaScript + Canvas + animação baseada em scroll + responsividade + performance.**

A proposta combina desenvolvimento de software com direção visual, criando uma experiência que vai além de uma página estática tradicional.

---

# 📌 Status

🟢 **Em desenvolvimento**

Novos recursos e otimizações podem ser adicionados conforme a evolução do projeto.

---

# 📄 Licença

Este projeto pode ser disponibilizado sob a licença definida pelo autor.

Caso nenhuma licença tenha sido definida, todos os direitos sobre o código e assets permanecem reservados ao autor.

---

## ⭐ Considerações

Este projeto demonstra a aplicação prática de conceitos de:

```text
Frontend
   +
JavaScript
   +
Canvas API
   +
Animation
   +
Responsive Design
   +
Performance
   +
UX/UI
```

O resultado é uma Hero interativa e cinematográfica capaz de transformar uma simples landing page em uma experiência visual mais imersiva.
