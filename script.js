// --- GET ELEMENTS ---
const countdownElement = document.getElementById('countdown');
const birthdayCard = document.getElementById('birthday-card');
const revealButton = document.getElementById('reveal-button');
const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');

// --- CANVAS SETUP ---
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- COUNTDOWN LOGIC ---
const birthday = new Date('2024-10-25T00:00:00').getTime();
const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = birthday - now;

    if (distance <= 0) {
        countdownElement.innerHTML = "It's Today!";
        if (!birthdayCard.classList.contains('flipped')) {
            birthdayCard.classList.add('flipped');
        }
        clearInterval(countdownInterval);
        return;
    }
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
};
const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

revealButton.addEventListener('click', () => {
    alert("My surprise is that I'll love you forever, Payal. I promise to always try my best for you. All my love, your Laadu (Raj) ❤️");
});


// --- ADVANCED ANIMATION LOGIC ---

// Load all our images
const catWalkImg = new Image();
catWalkImg.src = 'https://media.tenor.com/J3_n_t31KHYAAAAi/cat-walking-cat.gif';

const catRunImg = new Image();
catRunImg.src = 'https://i.gifer.com/origin/a6/a62b885834720e74f85e45532a84a250_w200.gif';

const catIdleImg = new Image();
catIdleImg.src = 'https://i.pinimg.com/originals/79/7c/01/797c013e33d2b3c1b63e4142f1f8d374.gif';

const laddooImg = new Image();
laddooImg.src = 'https://www.nicepng.com/png/full/49-492577_motichoor-laddu-png-ladoo-images-png.png';


const cats = [];
const laddoos = [];
const numCats = 5;

class Cat {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 50 + 75;
        this.speed = Math.random() * 1 + 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.state = 'walking'; // walking, idle, chasing
        this.stateTimer = Math.random() * 200 + 100;
        this.targetLaddoo = null;
        this.image = catWalkImg;
    }

    update() {
        this.stateTimer--;

        // State machine for cat behavior
        if (this.state === 'chasing' && this.targetLaddoo) {
            this.image = catRunImg;
            const dx = this.targetLaddoo.x - this.x;
            const dy = this.targetLaddoo.y - this.y;
            this.angle = Math.atan2(dy, dx);
            this.speed = 3; // Faster when chasing
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 20) { // Caught the laddoo
                this.targetLaddoo.isCaught = true;
                this.targetLaddoo = null;
                this.state = 'idle';
                this.stateTimer = 150; // Rest after catching
            }
        } else if (this.stateTimer <= 0) {
            // Switch state randomly
            const rand = Math.random();
            if (rand > 0.6) {
                this.state = 'walking';
                this.image = catWalkImg;
                this.speed = Math.random() * 1 + 0.5;
                this.stateTimer = Math.random() * 300 + 200;
                this.angle += (Math.random() - 0.5) * 0.5;
            } else {
                this.state = 'idle';
                this.image = catIdleImg;
                this.stateTimer = Math.random() * 200 + 100;
            }
        }

        // Move the cat based on its state
        if (this.state !== 'idle') {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            // Wall collision
            if (this.x < 0 || this.x > canvas.width - this.size) this.angle = Math.PI - this.angle;
            if (this.y < 0 || this.y > canvas.height - this.size) this.angle = -this.angle;
        }
    }

    draw() {
        ctx.save();
        // Flip image if angle is pointing left
        if (Math.cos(this.angle) < 0) {
            ctx.scale(-1, 1);
            ctx.drawImage(this.image, -this.x - this.size, this.y, this.size, this.size);
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        }
        ctx.restore();
    }
}

class Laddoo {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 40;
        this.life = 300; // Frames before it disappears
        this.isCaught = false;
    }
    update() {
        this.life--;
    }
    draw() {
        ctx.drawImage(laddooImg, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
}


// Create the initial cats
for (let i = 0; i < numCats; i++) {
    cats.push(new Cat());
}

// Main animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw laddoos
    for (let i = laddoos.length - 1; i >= 0; i--) {
        laddoos[i].update();
        laddoos[i].draw();
        if (laddoos[i].life <= 0 || laddoos[i].isCaught) {
            laddoos.splice(i, 1);
        }
    }

    // Update and draw cats
    cats.forEach(cat => {
        cat.update();
        cat.draw();
    });

    requestAnimationFrame(animate);
}

// Start animation once the first image is loaded
catWalkImg.onload = animate;


// --- INTERACTION ---
function handleInteraction(e) {
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;

    const newLaddoo = new Laddoo(x, y);
    laddoos.push(newLaddoo);

    // Find the nearest available cat to chase the new laddoo
    let nearestCat = null;
    let minDistance = Infinity;

    cats.forEach(cat => {
        if (cat.state !== 'chasing') {
            const dx = cat.x - x;
            const dy = cat.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestCat = cat;
            }
        }
    });

    if (nearestCat) {
        nearestCat.state = 'chasing';
        nearestCat.targetLaddoo = newLaddoo;
    }
}

document.body.addEventListener('click', handleInteraction);
document.body.addEventListener('touchstart', handleInteraction);

// Adjust canvas on resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

