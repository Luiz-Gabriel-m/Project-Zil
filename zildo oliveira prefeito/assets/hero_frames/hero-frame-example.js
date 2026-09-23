const canvas = document.querySelector("#hero-canvas");
const ctx = canvas.getContext("2d");
const isMobile = matchMedia("(max-width: 768px)");

const totalFrames = 120;
const fps = 12;
const folder = isMobile.matches ? "/hero-frames/mobile/" : "/hero-frames/desktop/";

const images = Array.from({length: totalFrames}, (_, i) => {
  const img = new Image();
  img.src = `${folder}frame_${String(i + 1).padStart(4, "0")}.webp`;
  return img;
});

function resize() {
  const mobile = isMobile.matches;
  canvas.width = mobile ? 720 : 1280;
  canvas.height = mobile ? 1280 : 720;
  draw(0);
}

function draw(index) {
  const img = images[index];
  if (!img || !img.complete) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

let start = performance.now();

function animate(now) {
  const elapsed = (now - start) / 1000;
  const index = Math.min(totalFrames - 1, Math.floor(elapsed * fps));
  draw(index);
  if (index < totalFrames - 1) requestAnimationFrame(animate);
}

Promise.all(images.map(img => new Promise(resolve => {
  img.onload = resolve;
  img.onerror = resolve;
}))).then(() => {
  resize();
  requestAnimationFrame(animate);
});

addEventListener("resize", resize);
