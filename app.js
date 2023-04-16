var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

const socketsConnecteds = {};
const MATRIX_SIZE = 10000;
const matriz = new Array(MATRIX_SIZE).fill().map(() => new Array(MATRIX_SIZE).fill().map(() => Math.floor(1)));

const socketConnection = (socket) => {
  console.log(`Novo socket conectado: ${socket.id}`);

  socketsConnecteds[socket.id] = {
    socket: socket,
  };

  socket.on("disconnect", () => {
    console.log(`Socket desconectado: ${socket.id}`);
    delete socketsConnecteds[socket.id];
  });

  socket.on("result", (result) => {
    
    console.log(`Result - ${socket.id}: ${result}`);
  });
};

function sumMatrix(matrix) {
  let sum = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      sum += matrix[i][j];
    }
  }
  return sum;
}

function dividirMatriz(matriz, N) {
  const tamanhoSubmatriz = Math.floor(matriz.length / N);
  const submatrizes = [];
  
  for (let i = 0; i < N; i++) {
    const submatriz = [];
    for (let j = i * tamanhoSubmatriz; j < (i + 1) * tamanhoSubmatriz; j++) {
      submatriz.push(matriz[j]);
    }
    submatrizes.push(submatriz);
  }
  
  return submatrizes;
}

setTimeout(() => {
  let numPartes = Object.keys(socketsConnecteds).length;
  let submatrizes = dividirMatriz(matriz, numPartes);

  console.log(submatrizes.length, numPartes);
  for (const socketId in socketsConnecteds) {
    const socket = socketsConnecteds[socketId].socket;
    console.log("Nova Instruction", socketId);
    socket.emit(
      "task",
      `
    const matrix = ${JSON.stringify(submatrizes.shift())};
    
    function sumMatrix(matrix) {
      let sum = 0;
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          sum += matrix[i][j];
        }
      }
      return sum;
    }

    const sum = sumMatrix(matrix);
    socket.emit("result", sum);
    document.querySelector("#status").innerHTML = "completed";
    `
    );
  }
}, 10000);

module.exports.socketConnection = socketConnection;
module.exports.app = app;
