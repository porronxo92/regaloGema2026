/* ===========================================
   REGALO 2 — Lista + Tres en raya con fotos
   =========================================== */

// ============ DATOS DE LA LISTA ============
const LIST_ITEMS = [
    {
        icon: '🍱',
        text: 'Hacer sushi en casa',
        desc: 'Un plan de viernes por la noche que llevan años aplazando. Ese día llegará pronto. 🍣'
    },
    {
        icon: '🧊',
        text: 'Ir a un icebar',
        desc: 'Todo de hielo, copas de hielo... y vosotros dos tiritando y riéndoos. 🥶'
    },
    {
        icon: '🥾',
        text: 'Ruta Salto de la Novia (Navajas)',
        desc: 'El río Palancia, cascadas y un camino que lleva tiempo esperándoos. 🏞️'
    },
    {
        icon: '⛰️',
        text: 'Subir a las Agujas de Santa Águeda',
        desc: 'Desde lo alto de Benicàssim, el Mediterráneo entero a vuestros pies. 🌊'
    }
];

// ============ ESTADO ============
let currentGameIndex = 0;
let scores = { gema: 0, ruben: 0 };
let boardState = Array(9).fill(null); // null | 'gema' | 'ruben'
let isGemaTurn = true;      // Gema siempre empieza
let gameOver = false;
const WINS_TO_MATCH = 2;    // primero en llegar a 2 gana el partido

const WINNING_COMBOS = [
    [0,1,2],[3,4,5],[6,7,8],  // filas
    [0,3,6],[1,4,7],[2,5,8],  // columnas
    [0,4,8],[2,4,6]           // diagonales
];

// ============ INICIO ============
document.addEventListener('DOMContentLoaded', () => {
    createStars();
});

function createStars() {
    const container = document.getElementById('stars');
    if (!container) return;
    for (let i = 0; i < 55; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        const size = 1 + Math.random() * 2;
        s.style.cssText = `
            left:${Math.random()*100}%;
            top:${Math.random()*100}%;
            width:${size}px; height:${size}px;
            animation-delay:${Math.random()*3}s;
            animation-duration:${2+Math.random()*3}s;
        `;
        container.appendChild(s);
    }
}

// ============ NAVEGACIÓN ============
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    setTimeout(() => document.getElementById(id).classList.add('active'), 30);
}

function startExperience() {
    showScreen('screen-list');
    setTimeout(animateList, 350);
}

function animateList() {
    document.querySelectorAll('.list-item').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 130);
    });
}

function goToGame(index) {
    currentGameIndex = index;
    scores = { gema: 0, ruben: 0 };
    setupGameScreen();
    showScreen('screen-game');
}

// ============ JUEGO — SETUP ============
function setupGameScreen() {
    updateMatchLabel();
    document.getElementById('gameTitle').textContent = 'Tres en raya';
    document.getElementById('scoreNumGema').textContent = '0';
    document.getElementById('scoreNumRuben').textContent = '0';
    document.getElementById('btnReplay').style.display = 'none';
    resetBoard();
}

function updateMatchLabel() {
    document.getElementById('gameStepLabel').textContent =
        `Al mejor de 3  ·  ${scores.gema} - ${scores.ruben}`;
}

function resetBoard() {
    boardState = Array(9).fill(null);
    isGemaTurn = true;
    gameOver = false;

    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('taken', 'win-cell');
    });

    document.getElementById('btnReplay').style.display = 'none';
    updateTurnIndicator();
}

function updateTurnIndicator() {
    const avatar = document.getElementById('turnAvatar');
    const text = document.getElementById('turnText');
    if (isGemaTurn) {
        avatar.src = 'img/gema.png';
        avatar.alt = 'Gema';
        text.textContent = 'Turno de Gema';
    } else {
        avatar.src = 'img/ruben.png';
        avatar.alt = 'Rubén';
        text.textContent = 'Turno de Rubén';
    }
}

// ============ JUEGO — CLICK ============
function handleClick(index) {
    if (gameOver || boardState[index] !== null) return;

    const player = isGemaTurn ? 'gema' : 'ruben';
    placeToken(index, player);
}

function placeToken(index, player) {
    boardState[index] = player;
    const cell = document.querySelector(`.cell[data-i="${index}"]`);
    const img = document.createElement('img');
    img.src = player === 'gema' ? 'img/gema.png' : 'img/ruben.png';
    img.alt = player;
    cell.appendChild(img);
    cell.classList.add('taken');

    isGemaTurn = (player === 'ruben'); // alterna turno
    if (!checkEnd(player)) {
        updateTurnIndicator();
    }
}

// ============ COMPROBAR FIN ============
function checkEnd(lastPlayer) {
    // ¿Hay ganador?
    for (const combo of WINNING_COMBOS) {
        if (combo.every(i => boardState[i] === lastPlayer)) {
            endGame(lastPlayer, combo);
            return true;
        }
    }
    // ¿Empate?
    if (boardState.every(v => v !== null)) {
        endGame(null, []);
        return true;
    }
    return false;
}

function endGame(winner, winCombo) {
    gameOver = true;

    if (winner) {
        // Marcar celdas ganadoras
        winCombo.forEach(i => {
            document.querySelector(`.cell[data-i="${i}"]`).classList.add('win-cell');
        });
    }

    if (winner === 'gema') {
        scores.gema++;
        document.getElementById('scoreNumGema').textContent = scores.gema;
        updateMatchLabel();
        if (scores.gema >= WINS_TO_MATCH) {
            // Gema gana el partido → ¡al reveal!
            setTimeout(() => {
                document.getElementById('turnText').textContent = '🎉 ¡Gema gana el partido!';
            }, 400);
            setTimeout(showReveal, 1600);
        } else {
            // Gema gana esta partida, queda otra
            setTimeout(() => {
                document.getElementById('turnText').textContent = `¡Gema gana esta! Marcador: ${scores.gema} - ${scores.ruben} 💪`;
            }, 400);
            setTimeout(resetBoard, 2000);
        }
    } else if (winner === 'ruben') {
        scores.ruben++;
        document.getElementById('scoreNumRuben').textContent = scores.ruben;
        updateMatchLabel();
        if (scores.ruben >= WINS_TO_MATCH) {
            // Rubén gana el partido → resetear todo y volver a empezar
            setTimeout(() => {
                document.getElementById('turnText').textContent = '¡Rubén gana el partido! 😏 Empezamos de nuevo...';
                document.getElementById('turnAvatar').src = 'img/ruben.png';
            }, 600);
            setTimeout(() => {
                scores = { gema: 0, ruben: 0 };
                document.getElementById('scoreNumGema').textContent = '0';
                document.getElementById('scoreNumRuben').textContent = '0';
                updateMatchLabel();
                resetBoard();
            }, 2800);
        } else {
            // Rubén gana esta partida, queda otra
            setTimeout(() => {
                document.getElementById('btnReplay').style.display = 'inline-flex';
                document.getElementById('turnText').textContent = `¡Rubén gana esta! Marcador: ${scores.gema} - ${scores.ruben} 😏`;
                document.getElementById('turnAvatar').src = 'img/ruben.png';
            }, 600);
        }
    } else {
        // Empate → reinicio automático
        setTimeout(() => {
            document.getElementById('turnText').textContent = 'Empate... ¡reiniciando!';
        }, 400);
        setTimeout(resetBoard, 1600);
    }
}

function resetGame() {
    resetBoard();
}

// ============ UNLOCK SCREEN ============
function showUnlock() {
    const item = LIST_ITEMS[currentGameIndex];
    document.getElementById('unlockIcon').textContent = item.icon;
    document.getElementById('unlockItem').textContent = item.text;
    document.getElementById('unlockDesc').textContent = item.desc;

    const isLast = currentGameIndex === LIST_ITEMS.length - 1;
    document.getElementById('btnNextGame').textContent = isLast ? 'Ver tu regalo 🎁' : 'Siguiente →';

    showScreen('screen-unlock');
    launchConfetti('confettiUnlock');
}

function continueAfterUnlock() {
    const nextIndex = currentGameIndex + 1;
    if (nextIndex < LIST_ITEMS.length) {
        goToGame(nextIndex);
    } else {
        showReveal();
    }
}

// ============ REVEAL FINAL ============
function showReveal() {
    showScreen('screen-reveal');
    setTimeout(() => launchConfetti('confettiFinal'), 500);
}

// ============ CONFETTI ============
function launchConfetti(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const colors = ['#C8A96B','#2D5A3F','#4A8B6B','#E8D4A8','#C17A50','#87CEEB','#FDF8F0'];

    for (let i = 0; i < 70; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        const color = colors[i % colors.length];
        const size  = 7 + Math.random() * 8;
        const isCircle = Math.random() > 0.5;

        piece.style.cssText = `
            left: ${Math.random() * 100}%;
            width: ${size}px; height: ${size}px;
            background: ${color};
            border-radius: ${isCircle ? '50%' : '3px'};
            animation-delay: ${Math.random() * 1.5}s;
            animation-duration: ${2.5 + Math.random() * 2}s;
        `;
        container.appendChild(piece);
    }

    setTimeout(() => { container.innerHTML = ''; }, 5500);
}

