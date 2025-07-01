const canvas = document.getElementById("trailCanvas");
const ctx = canvas.getContext("2d");

let isRepelling = false;

window.addEventListener("keydown", (e) => {
  if (e.key === " ") isRepelling = true;
});
window.addEventListener("keyup", (e) => {
  if (e.key === " ") isRepelling = false;
});

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Mouse tracking
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Burst trigger on clicks
window.addEventListener("click", (e) => {
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle(
      e.clientX + (Math.random() - 0.5) * 30,
      e.clientY + (Math.random() - 0.5) * 30,
      true
    ));
  }
});

// Starfield
const stars = [];
for (let i = 0; i < 200; i++) {
  stars.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5,
    o: Math.random() * 0.5 + 0.3
  });
}

class Particle {
  constructor(x, y, isBurst = false) {
    this.originX = x;
    this.originY = y;

    this.angle = Math.random() * Math.PI * 2;
    this.radius = 0;

    this.spinSpeed = -15 + Math.random() * 1;
    this.expansionSpeed = isBurst
      ? (4 + Math.random() * 4)
      : (1 + Math.random() * 2);

    this.size = 2 + Math.random() * 2;
    this.alpha = 1;
    this.color = isBurst
      ? `hsla(${Math.random() * 360}, 100%, 60%, ${this.alpha})`
      : `hsla(${Math.random() * 360}, 100%, 70%, ${this.alpha})`;

    this.x = x;
    this.y = y;

    if (isBurst) {
      const angle = Math.random() * Math.PI * 20;
      const speed = Math.random() * 8 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
    } else {
      this.vx = 0;
      this.vy = 0;
    }

    this.isBurst = isBurst;
  }

  update(targetX, targetY) {
    if (!this.isBurst) {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const forceDirX = dx / dist;
      const forceDirY = dy / dist;

      const force = isRepelling ? -1 : 1;
      const strength = 0.5 / dist;

      this.vx += forceDirX * strength * force;
      this.vy += forceDirY * strength * force;

      this.vx *= 0.92;
      this.vy *= 0.92;

      this.x += this.vx;
      this.y += this.vy;

      this.angle += this.spinSpeed;
      this.radius += this.expansionSpeed;

      this.x = targetX + Math.cos(this.angle) * this.radius;
      this.y = targetY + Math.sin(this.angle) * this.radius;
    } else {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.03;
    }

    this.alpha -= 0.015;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color.replace(/[\d.]+\)$/, `${this.alpha})`);
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  isDead() {
    return this.alpha <= 0;
  }
}

const particles = [];

function drawStars() {
  for (let s of stars) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${s.o})`;
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function animate() {
  requestAnimationFrame(animate);

  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars();

  particles.push(new Particle(mouse.x, mouse.y));

  for (let p of particles) {
    p.update(mouse.x, mouse.y);
    p.draw(ctx);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].isDead()) particles.splice(i, 1);
  }
}

animate();
