var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(3000);
var io = socket(server);

app.get(‘/’, function (req, res) {
 res.send(express.static('public'));
});

console.log("My socket server is running");

io.sockets.on('connection', newConnection);

function newConnection(socket) {
  console.log('new connection: ' + socket.id);
}
