/* ===========================================
   POTTERY SIMULATOR - Motor del juego
   
   Simula un torno de cerámica interactivo:
   - Fase 1: Modelar arrastrando para cambiar el perfil
   - Fase 2: Pintar tocando zonas de la pieza
   - Fase 3: Resultado final + revelación del regalo
   =========================================== */

// ============ ESTADO ============
const NUM_POINTS = 20; // Puntos del perfil
const BASE_RADIUS = 50;
const MAX_RADIUS = 120;
const MIN_RADIUS = 20;

let profile = []; // Array de radios por segmento vertical
let paintStrokes = []; // Colores pintados en zonas
let currentColor = '#c9a96e';
let rotationAngle = 0;
let animationFrame = null;

// ============ INICIALIZACIÓN ============

function initProfile() {
    profile = [];
    // Forma inicial: vasija clásica con barriga
    for (let i = 0; i < NUM_POINTS; i++) {
        const t = i / (NUM_POINTS - 1);
        // Base ancha, barriga, cuello estrecho, boca abierta
        let r;
        if (t < 0.1) {
            r = 45 + t * 80; // Base
        } else if (t < 0.6) {
            r = 55 + Math.sin((t - 0.1) / 0.5 * Math.PI) * 30; // Barriga
        } else if (t < 0.85) {
            r = 55 - (t - 0.6) / 0.25 * 20; // Cuello
        } else {
            r = 35 + (t - 0.85) / 0.15 * 12; // Boca
        }
        profile.push(r);
    }
}

function initPaint() {
    paintStrokes = [];
    for (let i = 0; i < NUM_POINTS; i++) {
        paintStrokes.push(null); // null = color base
    }
}

// ============ RENDERIZADO 3D SIMULADO ============

function renderPot(canvas, showGuides) {
    const ctx = canvas.getContext('2d');
    const w = canvas.logicalW || canvas.width;
    const h = canvas.logicalH || canvas.height;
    
    // Limpiar todo el canvas (incluyendo buffer real)
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    const centerX = w / 2;
    const bottomY = h - 30;
    const segmentH = (h - 80) / NUM_POINTS;
    
    // Sombra de fondo (efecto spotlight)
    const glow = ctx.createRadialGradient(centerX, h * 0.6, 0, centerX, h * 0.6, w * 0.5);
    glow.addColorStop(0, 'rgba(201, 169, 110, 0.03)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Número de franjas verticales para efecto 3D (círculo completo)
    const slices = 32;
    const angleStep = (2 * Math.PI) / slices;
    
    // Dibujar la pieza franja por franja (back to front)
    // Primero calculamos qué franjas son visibles y las ordenamos por profundidad
    const visibleSlices = [];
    for (let s = 0; s < slices; s++) {
        const angle = rotationAngle + s * angleStep;
        const midAngle = angle + angleStep / 2;
        const depth = Math.cos(midAngle); // -1 (atrás) a +1 (adelante)
        visibleSlices.push({ s, angle, depth });
    }
    // Ordenar de atrás hacia adelante
    visibleSlices.sort((a, b) => a.depth - b.depth);
    
    for (const slice of visibleSlices) {
        const angle = slice.angle;
        const nextAngle = angle + angleStep;
        
        const cosA = Math.cos(angle);
        const cosB = Math.cos(nextAngle);
        
        for (let i = 0; i < NUM_POINTS - 1; i++) {
            const r1 = profile[i];
            const r2 = profile[i + 1];
            const y1 = bottomY - (i + 1) * segmentH;
            const y2 = bottomY - (i + 2) * segmentH;
            
            const x1a = centerX + r1 * cosA;
            const x1b = centerX + r1 * cosB;
            const x2a = centerX + r2 * cosA;
            const x2b = centerX + r2 * cosB;
            
            // Iluminación basada en ángulo
            const lightFactor = (cosA + cosB) / 2;
            const brightness = 0.4 + lightFactor * 0.4;
            
            // Color de la franja
            let baseColor;
            if (paintStrokes[i] && paintStrokes[i] !== null) {
                baseColor = paintStrokes[i];
            } else {
                baseColor = '#c9a96e';
            }
            
            // Aplicar iluminación
            const color = adjustBrightness(baseColor, brightness);
            
            ctx.beginPath();
            ctx.moveTo(x1a, y1);
            ctx.lineTo(x1b, y1);
            ctx.lineTo(x2b, y2);
            ctx.lineTo(x2a, y2);
            ctx.closePath();
            
            ctx.fillStyle = color;
            ctx.fill();
            
            // Borde sutil entre franjas
            if (lightFactor > 0.3) {
                ctx.strokeStyle = adjustBrightness(baseColor, brightness * 0.85);
                ctx.lineWidth = 0.3;
                ctx.stroke();
            }
        }
    }
    
    // Borde interior (apertura superior)
    const topR = profile[NUM_POINTS - 1];
    ctx.beginPath();
    ctx.ellipse(centerX, bottomY - NUM_POINTS * segmentH, topR, topR * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2a2015';
    ctx.fill();
    ctx.strokeStyle = adjustBrightness('#c9a96e', 0.6);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Base del torno (ellipse)
    ctx.beginPath();
    ctx.ellipse(centerX, bottomY + 5, profile[0] + 15, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#444';
    ctx.fill();
    
    // Guías (solo en modo modelar)
    if (showGuides) {
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < NUM_POINTS; i += 4) {
            const y = bottomY - (i + 1) * segmentH;
            ctx.beginPath();
            ctx.moveTo(centerX - MAX_RADIUS - 10, y);
            ctx.lineTo(centerX + MAX_RADIUS + 10, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }
}

function adjustBrightness(hex, factor) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    r = Math.min(255, Math.floor(r * factor));
    g = Math.min(255, Math.floor(g * factor));
    b = Math.min(255, Math.floor(b * factor));
    
    return `rgb(${r},${g},${b})`;
}

// ============ ANIMACIÓN DE ROTACIÓN ============

function startRotation(canvasId, showGuides) {
    const canvas = document.getElementById(canvasId);
    
    function animate() {
        rotationAngle += 0.02;
        renderPot(canvas, showGuides);
        animationFrame = requestAnimationFrame(animate);
    }
    animate();
}

function stopRotation() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
}

// ============ MODELADO (SCULPT) ============

let isSculpting = false;
let lastSculptY = 0;

function setupSculptCanvas() {
    const canvas = document.getElementById('potteryCanvas');
    const dpr = window.devicePixelRatio || 1;
    const w = Math.min(350, window.innerWidth - 40);
    const h = Math.min(450, window.innerHeight - 250);
    
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    // Dimensiones lógicas para coordenadas
    canvas.logicalW = w;
    canvas.logicalH = h;
    
    // Touch events
    canvas.addEventListener('mousedown', sculptStart);
    canvas.addEventListener('mousemove', sculptMove);
    canvas.addEventListener('mouseup', sculptEnd);
    canvas.addEventListener('mouseleave', sculptEnd);
    canvas.addEventListener('touchstart', sculptStart, { passive: false });
    canvas.addEventListener('touchmove', sculptMove, { passive: false });
    canvas.addEventListener('touchend', sculptEnd);
    
    startRotation('potteryCanvas', true);
}

function sculptStart(e) {
    e.preventDefault();
    isSculpting = true;
    const pos = getCanvasPos(e, 'potteryCanvas');
    lastSculptY = pos.y;
}

function sculptMove(e) {
    if (!isSculpting) return;
    e.preventDefault();
    
    const canvas = document.getElementById('potteryCanvas');
    const pos = getCanvasPos(e, 'potteryCanvas');
    const h = canvas.logicalH;
    const bottomY = h - 30;
    const segmentH = (h - 80) / NUM_POINTS;
    
    // Determinar qué segmento estamos tocando
    const segIndex = Math.floor((bottomY - pos.y) / segmentH);
    
    if (segIndex >= 0 && segIndex < NUM_POINTS) {
        // Distancia horizontal al centro determina el radio
        const centerX = canvas.logicalW / 2;
        const dist = Math.abs(pos.x - centerX);
        
        // Suavizar el cambio
        const targetR = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, dist));
        profile[segIndex] = profile[segIndex] * 0.6 + targetR * 0.4;
        
        // Suavizar vecinos
        if (segIndex > 0) {
            profile[segIndex - 1] = profile[segIndex - 1] * 0.8 + profile[segIndex] * 0.2;
        }
        if (segIndex < NUM_POINTS - 1) {
            profile[segIndex + 1] = profile[segIndex + 1] * 0.8 + profile[segIndex] * 0.2;
        }
    }
}

function sculptEnd() {
    isSculpting = false;
}

// ============ PINTAR ============

let isPainting = false;

function setupPaintCanvas() {
    const canvas = document.getElementById('paintCanvas');
    const dpr = window.devicePixelRatio || 1;
    const w = Math.min(350, window.innerWidth - 40);
    const h = Math.min(450, window.innerHeight - 280);
    
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    canvas.logicalW = w;
    canvas.logicalH = h;
    
    canvas.addEventListener('mousedown', paintStart);
    canvas.addEventListener('mousemove', paintMove);
    canvas.addEventListener('mouseup', paintEnd);
    canvas.addEventListener('mouseleave', paintEnd);
    canvas.addEventListener('touchstart', paintStart, { passive: false });
    canvas.addEventListener('touchmove', paintMove, { passive: false });
    canvas.addEventListener('touchend', paintEnd);
    
    stopRotation();
    startRotation('paintCanvas', false);
}

function paintStart(e) {
    e.preventDefault();
    isPainting = true;
    applyPaint(e);
}

function paintMove(e) {
    if (!isPainting) return;
    e.preventDefault();
    applyPaint(e);
}

function paintEnd() {
    isPainting = false;
}

function applyPaint(e) {
    const canvas = document.getElementById('paintCanvas');
    const pos = getCanvasPos(e, 'paintCanvas');
    const h = canvas.logicalH;
    const bottomY = h - 30;
    const segmentH = (h - 80) / NUM_POINTS;
    
    const segIndex = Math.floor((bottomY - pos.y) / segmentH);
    
    if (segIndex >= 0 && segIndex < NUM_POINTS) {
        // Verificar que estamos dentro del perfil de la pieza
        const centerX = canvas.logicalW / 2;
        const dist = Math.abs(pos.x - centerX);
        
        if (dist <= profile[segIndex] + 10) {
            paintStrokes[segIndex] = currentColor;
            // Pintar vecinos cercanos para efecto pincel ancho
            if (segIndex > 0) paintStrokes[segIndex - 1] = currentColor;
            if (segIndex < NUM_POINTS - 1) paintStrokes[segIndex + 1] = currentColor;
        }
    }
}

function selectColor(el) {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    currentColor = el.getAttribute('data-color');
}

// ============ NAVEGACIÓN ============

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    
    setTimeout(() => {
        document.getElementById(id).classList.add('active');
    }, 300);
}

function startExperience() {
    showScreen('screen-sculpt');
    setTimeout(() => {
        initProfile();
        initPaint();
        setupSculptCanvas();
    }, 350);
}

function goToPaint() {
    stopRotation();
    showScreen('screen-paint');
    setTimeout(setupPaintCanvas, 350);
}

function goToFinal() {
    stopRotation();
    showScreen('screen-final');
    setTimeout(() => {
        setupFinalCanvas();
        launchConfetti();
    }, 400);
}

function setupFinalCanvas() {
    const canvas = document.getElementById('finalCanvas');
    const dpr = window.devicePixelRatio || 1;
    const w = Math.min(280, window.innerWidth - 60);
    const h = Math.min(320, window.innerHeight * 0.35);
    
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    canvas.logicalW = w;
    canvas.logicalH = h;
    
    startRotation('finalCanvas', false);
}

function resetShape() {
    initProfile();
}

function resetPaint() {
    initPaint();
}

// ============ UTILIDADES ============

function getCanvasPos(e, canvasId) {
    const canvas = document.getElementById(canvasId);
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: (clientX - rect.left) * (canvas.logicalW / rect.width),
        y: (clientY - rect.top) * (canvas.logicalH / rect.height)
    };
}

// ============ CONFETTI ============

function launchConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#c9a96e', '#1B5E3C', '#b35c3a', '#e8d4b8', '#F2EFE6', '#8b6b4a'];
    
    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti');
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = (Math.random() * 2) + 's';
        piece.style.width = (Math.random() * 8 + 5) + 'px';
        piece.style.height = (Math.random() * 8 + 5) + 'px';
        container.appendChild(piece);
    }
    
    setTimeout(() => container.innerHTML = '', 5000);
}

// ============ INIT ============
// Prevenir scroll en móvil
document.addEventListener('touchmove', (e) => {
    if (document.querySelector('#screen-sculpt.active') || 
        document.querySelector('#screen-paint.active')) {
        e.preventDefault();
    }
}, { passive: false });
