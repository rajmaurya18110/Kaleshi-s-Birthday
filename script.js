// --- GET ELEMENTS ---
const countdownElement = document.getElementById('countdown');
const birthdayCard = document.getElementById('birthday-card');
const animationContainer = document.getElementById('animation-container');
const showerContainer = document.getElementById('shower-container');
const backContentSlides = document.querySelectorAll('.back-content');

// --- STATE & RESPONSIVE SIZES ---
let countdownFinished = false;
let currentSlideIndex = 0;
let isTransitioning = false;
let hasInteracted = false;
let draggedLaddoo = null;
let longPressTimer;
let catDimensions = { width: 220, height: 200 };
let laddooRadius = 45;

// Function to calculate responsive sizes in pixels
function updateSizes() {
    const catElement = cats.length > 0 ? cats[0].element : document.querySelector('.cat');
    if (catElement) {
        catDimensions.width = catElement.offsetWidth;
        catDimensions.height = catElement.offsetHeight;
    }
    
    const laddooElement = laddoos.length > 0 ? laddoos[0].element : document.querySelector('.laddoo');
    if (laddooElement) {
        laddooRadius = laddooElement.offsetWidth / 2;
    } else {
        // Fallback calculation if no laddoo exists yet
        const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
        laddooRadius = Math.max(45, 8 * vmin) / 2;
    }
}


// --- IMPROVED SOUND SETUP ---
const synth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 2 } }).toDestination();
synth.volume.value = -12;
const meowEffect = new Tone.PitchShift({ pitch: 4, windowSize: 0.08, feedback: 0.1 }).toDestination();
const meowSynth = new Tone.FMSynth({ harmonicity: 2, modulationIndex: 10, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.8 }, modulationEnvelope: { attack: 0.05, decay: 0.1, sustain: 0.5, release: 0.1 } }).connect(meowEffect);
meowSynth.volume.value = -18;

const sounds = [
    { melody: ['G4', 'G4', 'A4', 'G4', 'C5', 'B4', 'G4', 'G4', 'A4', 'G4', 'D5', 'C5'], duration: '8n', isArpeggio: false },
    { melody: ['E4', 'G4', 'B4', 'D5'], duration: '8n', isArpeggio: true }, { melody: ['F4', 'A4', 'C5', 'E5'], duration: '8n', isArpeggio: true },
    { melody: ['G4', 'B4', 'D5', 'F#5'], duration: '8n', isArpeggio: true }
];

function playSound(soundIndex) {
    if (!hasInteracted) { Tone.start(); hasInteracted = true; }
    const sound = sounds[soundIndex % sounds.length];
    const now = Tone.now();
    if (sound.isArpeggio) sound.melody.forEach((note, i) => synth.triggerAttackRelease(note, sound.duration, now + i * 0.15));
    else sound.melody.forEach((note, i) => synth.triggerAttackRelease(note, sound.duration, now + i * 0.2));
}

function playMeow(pitch = 500) {
    if (!hasInteracted) return;
    meowSynth.triggerAttackRelease(pitch, '8n');
}

// --- COUNTDOWN LOGIC ---
const birthday = new Date('2024-10-25T00:00:00').getTime();
const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = birthday - now;
    if (distance <= 0) {
        countdownElement.innerHTML = "It's Today!";
        countdownFinished = true;
        clearInterval(countdownInterval);
        return;
    }
    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);
    countdownElement.innerHTML = `${d}d ${h}h ${m}m ${s}s`;
};
const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// --- SHOWER EFFECT LOGIC ---
const showerEmojis = ['🎂', '🌹', '🍫', '❤️'];
function createShower(emoji, clickX, clickY, soundIndex) {
    for (let i = 0; i < 100; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        p.innerHTML = emoji;
        p.style.left = `${clickX}px`;
        p.style.top = `${clickY}px`;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.max(window.innerWidth, window.innerHeight) * 1.2;
        p.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px) scale(0)`, opacity: 0 }
        ], { duration: 2500, easing: 'cubic-bezier(0.17, 0.88, 0.32, 1.28)', delay: Math.random() * 200 });
        showerContainer.appendChild(p);
        setTimeout(() => p.remove(), 3000);
    }
    playSound(soundIndex);
}

// --- CAT & LADDOO ANIMATION LOGIC ---
const cats = [];
const laddoos = [];
const numCats = 6;

class Cat {
    constructor(colorIndex) {
        this.createElement(colorIndex);
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5;
        this.state = 'walking';
        this.stateTimer = Math.random() * 200 + 100;
        this.meowTimer = Math.random() * 500 + 300;
        this.targetLaddoo = null;
    }

    createElement(colorIndex) {
        this.element = document.createElement('div');
        this.element.className = 'cat walking';
        this.element.style.setProperty('--cat-color', `var(--cat-color-${colorIndex + 1})`);
        this.element.innerHTML = `<div class="tail"></div><div class="cat-body"></div><div class="cat-head"><div class="mouth"></div><div class="ear ear-left"></div><div class="ear ear-right"></div><div class="eye eye-left"></div><div class="eye eye-right"></div></div><div class="leg leg-front-left"></div><div class="leg leg-front-right"></div><div class="leg leg-back-left"></div><div class="leg leg-back-right"></div>`;
        animationContainer.appendChild(this.element);
    }

    update() {
        this.stateTimer--;
        this.meowTimer--;
        if (this.meowTimer <= 0 && this.state !== 'chasing') {
            playMeow(Math.random() * 200 + 400);
            this.meowTimer = Math.random() * 800 + 500;
        }

        if (this.targetLaddoo && (!this.targetLaddoo.isEatable || this.targetLaddoo.isDragged)) {
            this.targetLaddoo.chaser = null;
            this.targetLaddoo = null;
            this.state = 'idle';
            this.stateTimer = 30;
        }
        
        if ((this.state === 'chasing' || this.state === 'playing') && this.targetLaddoo) {
            const dx = this.targetLaddoo.x - (this.x + catDimensions.width / 2);
            const dy = this.targetLaddoo.y - (this.y + catDimensions.height / 2);
            const dist = Math.hypot(dx, dy);

            if (dist < catDimensions.width / 2) { // Dynamic interaction distance
                const isPlaytimeOver = (Date.now() - this.targetLaddoo.createdAt) > 60000;
                if (isPlaytimeOver && this.targetLaddoo.isEatable) {
                    this.state = 'eating';
                    this.stateTimer = 600;
                    this.targetLaddoo.getEaten();
                    this.targetLaddoo = null;
                } else if (!this.targetLaddoo.isBeingHit) {
                    this.state = 'playing';
                    this.stateTimer = 50;
                    this.targetLaddoo.hit(this);
                    this.targetLaddoo = null;
                }
            } else {
                const angle = Math.atan2(dy, dx);
                this.speedX = Math.cos(angle) * 4.5;
                this.speedY = Math.sin(angle) * 4.5;
            }
        } else if (this.stateTimer <= 0 && this.state !== 'eating') {
            let availableLaddoo = laddoos.find(l => l.isEatable && !l.chaser && !l.isDragged);
            if (availableLaddoo) {
                this.state = 'chasing';
                this.targetLaddoo = availableLaddoo;
                availableLaddoo.chaser = this;
            } else {
                this.state = (Math.random() > 0.4) ? 'walking' : 'idle';
                if (this.state === 'walking') {
                    this.speedX = (Math.random() - 0.5) * 1.5;
                    this.speedY = (Math.random() - 0.5) * 1.5;
                    this.stateTimer = Math.random() * 300 + 200;
                } else {
                    this.stateTimer = Math.random() * 200 + 100;
                }
            }
        }

        const isMoving = this.state === 'walking' || this.state === 'chasing' || this.state === 'playing';
        if (isMoving) {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0) { this.x = 0; this.speedX *= -1; }
            if (this.x > window.innerWidth - catDimensions.width) { this.x = window.innerWidth - catDimensions.width; this.speedX *= -1; }
            if (this.y < 0) { this.y = 0; this.speedY *= -1; }
            if (this.y > window.innerHeight - catDimensions.height) { this.y = window.innerHeight - catDimensions.height; this.speedY *= -1; }
            
            this.element.classList.add('walking');
        } else {
            this.element.classList.remove('walking');
        }
        this.draw();
    }
    draw() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.transform = `scaleX(${this.speedX < 0 ? -1 : 1})`;
    }
}

class Laddoo {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.speedX = 0; this.speedY = 0;
        this.friction = 0.98;
        this.createdAt = Date.now();
        this.isBeingHit = false;
        this.isEatable = true;
        this.isDragged = false;
        this.chaser = null;
        this.createElement();
    }
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'laddoo';
        animationContainer.appendChild(this.element);
        updateSizes(); // Update sizes now that a laddoo exists

        this.element.addEventListener('dblclick', (e) => { e.stopPropagation(); this.startDrag(); });
        this.element.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            longPressTimer = setTimeout(() => { e.preventDefault(); this.startDrag(); }, 300);
        }, { passive: false });
        this.element.addEventListener('touchend', () => clearTimeout(longPressTimer));
        this.element.addEventListener('touchmove', (e) => { e.stopPropagation(); clearTimeout(longPressTimer); });
    }
    startDrag() {
        this.isDragged = true;
        draggedLaddoo = this;
        if (this.chaser) { this.chaser.targetLaddoo = null; this.chaser = null; }
        this.element.classList.add('dragging');
    }
    update() {
        if (!this.isDragged) {
            if (!this.isBeingHit) {
                this.speedX *= this.friction; this.speedY *= this.friction;
                this.x += this.speedX; this.y += this.speedY;
                
                if (this.x < laddooRadius) { this.x = laddooRadius; this.speedX *= -0.8; }
                if (this.x > window.innerWidth - laddooRadius) { this.x = window.innerWidth - laddooRadius; this.speedX *= -0.8; }
                if (this.y < laddooRadius) { this.y = laddooRadius; this.speedY *= -0.8; }
                if (this.y > window.innerHeight - laddooRadius) { this.y = window.innerHeight - laddooRadius; this.speedY *= -0.8; }
            }
        }
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    hit(hitterCat) {
        playMeow(700);
        this.isBeingHit = true;
        this.chaser = null;
        
        let avgX = 0, avgY = 0, otherCatsCount = 0;
        cats.forEach(cat => {
            if (cat !== hitterCat) { avgX += cat.x; avgY += cat.y; otherCatsCount++; }
        });
        avgX = otherCatsCount > 0 ? avgX / otherCatsCount : hitterCat.x;
        avgY = otherCatsCount > 0 ? avgY / otherCatsCount : hitterCat.y;
        
        const pushAngle = Math.atan2(this.y - avgY, this.x - avgX);
        const pushForce = 30;
        this.speedX = Math.cos(pushAngle) * pushForce;
        this.speedY = Math.sin(pushAngle) * pushForce;

        setTimeout(() => { this.isBeingHit = false; }, 100);
    }
    getEaten() {
        this.isEatable = false;
        if (this.chaser) { this.chaser.targetLaddoo = null; this.chaser = null; }
        this.element.style.transition = 'transform 10s ease-in, opacity 10s ease-in';
        this.element.style.transform = 'translate(-50%, -50%) scale(0)';
        this.element.style.opacity = '0';
        setTimeout(() => this.remove(), 10000);
    }
    remove() {
        if (this.element.parentElement) this.element.parentElement.removeChild(this.element);
        const index = laddoos.indexOf(this);
        if (index > -1) laddoos.splice(index, 1);
    }
}

for (let i = 0; i < numCats; i++) {
    cats.push(new Cat(i));
}
updateSizes(); // Initial size calculation

function animate() {
    cats.forEach(cat => cat.update());
    laddoos.forEach(laddoo => laddoo.update());
    requestAnimationFrame(animate);
}
animate();

// --- EVENT LISTENERS ---
function handleInteraction(e) {
    if (!hasInteracted) { Tone.start(); hasInteracted = true; }
    
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    if (x === undefined) return;
    
    const cardRect = birthdayCard.getBoundingClientRect();
    const isOverLaddoo = e.target.classList.contains('laddoo');

    if (x > cardRect.left && x < cardRect.right && y > cardRect.top && y < cardRect.bottom) {
        // Card interaction logic...
        if (isTransitioning) return;
        if (!countdownFinished) { birthdayCard.classList.add('shake'); setTimeout(() => birthdayCard.classList.remove('shake'), 500); return; }
        if (!birthdayCard.classList.contains('flipped')) {
            birthdayCard.classList.add('flipped');
            createShower(showerEmojis[0], x, y, 0);
        } else {
            isTransitioning = true;
            const nextSlideIndex = (currentSlideIndex + 1) % backContentSlides.length;
            createShower(showerEmojis[nextSlideIndex], x, y, nextSlideIndex);
            backContentSlides[currentSlideIndex].classList.add('exiting');
            setTimeout(() => {
                currentSlideIndex = nextSlideIndex;
                backContentSlides.forEach((slide, i) => {
                    slide.classList.remove('active', 'exiting');
                    if (i === currentSlideIndex) slide.classList.add('active');
                });
                isTransitioning = false;
            }, 1500);
        }
    } 
    else if (!isOverLaddoo) {
        laddoos.push(new Laddoo(x, y));
    }
}

window.addEventListener('click', handleInteraction);
window.addEventListener('touchstart', (e) => {
    if (!e.target.closest('#birthday-card') && !e.target.classList.contains('laddoo')) e.preventDefault();
    handleInteraction(e);
}, { passive: false });

window.addEventListener('resize', updateSizes);

// --- DRAG AND DROP LOGIC ---
function onMouseMove(e) {
    if (!draggedLaddoo) return;
    draggedLaddoo.x = e.clientX;
    draggedLaddoo.y = e.clientY;
}
function onTouchMove(e) {
    if (!draggedLaddoo) return;
    e.preventDefault();
    draggedLaddoo.x = e.touches[0].clientX;
    draggedLaddoo.y = e.touches[0].clientY;
}
function stopDragging() {
    if (!draggedLaddoo) return;
    draggedLaddoo.isDragged = false;
    draggedLaddoo.element.classList.remove('dragging');
    draggedLaddoo = null;
}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('touchmove', onTouchMove, { passive: false });
window.addEventListener('mouseup', stopDragging);
window.addEventListener('touchend', stopDragging);


