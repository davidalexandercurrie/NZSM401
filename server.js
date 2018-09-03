var express = require('express');
var socket = require('socket.io');

var app = express();

var io = socket(server);

app.listen(process.env.PORT, process.env.IP, function(){
  console.log("My socket server is running");
})

io.sockets.on('connection', newConnection);

function newConnection(socket) {
  console.log('new connection: ' + socket.id);
}
