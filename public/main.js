var socket = io();

socket.on("task", (data) => {
  document.querySelector("#status").innerHTML = "processing task";
  eval(data);
  

});

socket.on("connect", () => {
  document.querySelector("#socketID").innerHTML = socket.id;
  document.querySelector("#status").innerHTML = "connected";
  console.log("Conectado ao servidor");
});

socket.on("disconnect", () => {
  document.querySelector("#status").innerHTML = "disconnected";

  console.log("Desconectado do servidor");
});