const squares = document.querySelectorAll(".square");
let currentPlayer = "gema";
let bienvenida = document.querySelectorAll("#bienvenida");
let tablero = document.querySelector("#tablero");

// Creamos un array de 3x3 para representar nuestro tablero
let board = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

let jugadores = {
  O: "gema",
  X: "ruben",
};

let imagenes = {
  gema: '<img src="../img/gema.png" alt="O">',
  ruben: '<img src="../img/ruben.png" alt="X">',
};

squares.forEach((square) => {
  square.addEventListener("click", play);
});

//O - Gema >> X -Ruben
function play(event) {
  const square = event.target;
  console.log("JUGADOR ACTUAL: " + currentPlayer);
  var colIndex = square.cellIndex;
  var rowIndex = square.parentNode.rowIndex;
  board[rowIndex][colIndex] = currentPlayer;
  cambiarJugador(square);
  if (jugadores.O == checkWinner(board)) {
    mostrarModal(
      "🎉 HAS GANADO 🎉",
      "Increible mi amor, me has ganado, vas lanzada como una montaña rusa 🎢 a por tu regalo >> 🎁. ",
      "Siguiente nivel --> ⚡",
      true
    );
  } else if (jugadores.X == checkWinner(board) ) {
    mostrarModal(
      "😖 HAS PERDIDO 😖",
      "Vas a dar mas vueltas que una noria 🎡, hasta que no ganes no hay regalo. 🎁",
      "🎮 Volver a jugar 🎮",
      false
    );
    
  } else if ((comprobarMatriz(board) && checkWinner(board) === "")) {
    mostrarModal(
        "😜 NADIE GANA, PERO PIERDES 😜",
        "Esto es asi, o ganas o ganas 🏆",
        "🎮 Volver a jugar 🎮",
        false
      );
  }
}

function cambiarJugador(square) {
  if (currentPlayer == jugadores.O) {
    square.innerHTML = imagenes[currentPlayer];
    currentPlayer = jugadores.X;
  } else {
    square.innerHTML = imagenes[currentPlayer];
    currentPlayer = jugadores.O;
  }
}

function reset() {
  squares.forEach((square) => {
    square.textContent = "";
  });
  currentPlayer = "gema";
  board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
}

//Mostral modal cuando todas las respuestas son correctas
function mostrarModal(header, mensaje, btnModal, logic) {
  var modal = document.getElementById("modal");
  var botonCerrar = document.getElementById("cerrarModal");
  var headerModal = document.getElementById("headerModal");
  var mensajeModal = document.getElementById("mensajeModal");
  modal.style.display = "block";

  headerModal.innerHTML = header;
  mensajeModal.innerHTML = mensaje;
  botonCerrar.innerHTML = btnModal;

  botonCerrar.onclick = function () {
    if (logic) {
      window.location.href = "../encontrar-pareja.html";
    } else {
      reset();
      modal.style.display = "none";
    }
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

// Función para comprobar si hay un ganador, true si hay ganador
function checkWinner(board) {
  // Comprobar filas
  for (let row = 0; row < 3; row++) {
    if (
      board[row][0] !== "" &&
      board[row][0] === board[row][1] &&
      board[row][0] === board[row][2]
    ) {
      return jugadores.O === board[row][0] ? jugadores.O : jugadores.X;
    }
  }

  // Comprobar columnas
  for (let col = 0; col < 3; col++) {
    if (
      board[0][col] !== "" &&
      board[0][col] === board[1][col] &&
      board[0][col] === board[2][col]
    ) {
      return jugadores.O === board[0][col] ? jugadores.O : jugadores.X;
    }
  }

  // Comprobar diagonal principal
  if (
    board[0][0] !== "" &&
    board[0][0] === board[1][1] &&
    board[0][0] === board[2][2]
  ) {
    return jugadores.O === board[0][0] ? jugadores.O : jugadores.X;
  }

  // Comprobar diagonal secundaria
  if (
    board[0][2] !== "" &&
    board[0][2] === board[1][1] &&
    board[0][2] === board[2][0]
  ) {
    return jugadores.O === board[0][2] ? jugadores.O : jugadores.X;
  }

  // Si no hay ganador, devolver false
  return "";
}

function comprobarMatriz(matriz) {
  for (let i = 0; i < matriz.length; i++) {
    if (!matriz[i].every((elem) => elem !== "")) {
      return false;
    }
  }
  return true;
}

function ajugar(){
  bienvenida[0].style.display = "none";
  tablero.classList.remove("no-visible");
  tablero.classList.add("juego");
}
