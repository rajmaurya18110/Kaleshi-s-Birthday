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
    x
