// Countdown Timer
const countdown = document.getElementById('countdown');
const targetDate = new Date('2025-10-25T00:00:00').getTime();

setInterval(() => {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance < 0) {
    countdown.innerHTML = "🎉 Happy Birthday Kaleshi! 🎉";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  countdown.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s until your special day 🎂`;
}, 1000);


// Canvas setup
const canvas = document.getElementById('catCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

// Load cat image
const catImg = new Image();
catImg.src = 'https://cdn-icons-png.flaticon.com/512/616/616408.png'; // cute cat PNG

// Load laddoo image
const laddooImg = new Image();
laddooImg.src = 'https://cdn-icons-png.flaticon.com/512/415/415733.png'; // small round candy/laddoo

// Cat objects
const cats = [];
const numCats = 6;

for (let i = 0; i < numCats; i++) {
  cats.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speedX: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1),
    speedY: (Math.random() * 1.5 + 0.5) * (Math.random() < 0.5 ? 1 : -1),
    size: 50 + Math.random() * 30
  });
}

// Laddoo objects (appear on click)
const laddoos = [];

// Draw loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw cats
  cats.forEach(cat => {
    ctx.drawImage(catImg, cat.x, cat.y, cat.size, cat.size);

    // Move cats
    cat.x += cat.speedX;
    cat.y += cat.speedY;

    // Bounce off walls
    if (cat.x + cat.size > canvas.width || cat.x < 0) cat.speedX *= -1;
    if (cat.y + cat.size > canvas.height || cat.y < 0) cat.speedY *= -1;
  });

  // Draw laddoos
  laddoos.forEach((lad, index) => {
    ctx.drawImage(laddooImg, lad.x, lad.y, 30, 30);
    lad.life--;

    if (lad.life <= 0) {
      laddoos.splice(index, 1);
    }
  });

  requestAnimationFrame(animate);
}

animate();

// Click to spawn laddoo
canvas.addEventListener('click', (e) => {
  laddoos.push({
    x: e.clientX - 15,
    y: e.clientY - 15,
    life: 150 // frames before disappearing
  });

  // Optional: move nearest cat toward laddoo
  let nearest = cats.reduce((prev, curr) => {
    const prevDist = Math.hypot(prev.x - e.clientX, prev.y - e.clientY);
    const currDist = Math.hypot(curr.x - e.clientX, curr.y - e.clientY);
    return currDist < prevDist ? curr : prev;
  });
  nearest.speedX = (e.clientX - nearest.x) / 50;
  nearest.speedY = (e.clientY - nearest.y) / 50;
});

// Resize canvas on window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
