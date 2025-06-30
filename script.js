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

class Particle {
  constructor(x, y) {
    this.originX = x;
    this.originY = y;

    this.angle = Math.random() * Math.PI * 2;
    this.radius = 0;

    this.spinSpeed = -0.05 + Math.random() * 0.1;
    this.expansionSpeed = 2 + Math.random() * 3;

    this.size = 2 + Math.random() * 2;
    this.alpha = 1;
    this.color = `hsla(${Math.random() * 360}, 100%, 70%, ${this.alpha})`;

    // Initialize position and velocity
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }

  update(targetX, targetY) {
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

    // Spiral motion
    this.angle += this.spinSpeed;
    this.radius += this.expansionSpeed;

    this.x = targetX + Math.cos(this.angle) * this.radius;
    this.y = targetY + Math.sin(this.angle) * this.radius;

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

function animate() {
  requestAnimationFrame(animate);

  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.push(new Particle(mouse.x, mouse.y));

  particles.forEach((p) => {
    p.update(mouse.x, mouse.y);
    p.draw(ctx);
  });

  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

animate();
