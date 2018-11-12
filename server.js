//include node.js packages
var express = require('express');
var socket = require('socket.io');

//server creation
var app = express();
var server = app.listen(process.env.PORT || 3000, process.env.IP, () => console.log("server is running"));
//initiate web sockets
var io = socket(server);
//route to index.html in /public directory
app.use(express.static(__dirname + '/public'));

//function to receive and send data via websockets from clients
io.sockets.on('connection', (socket) => {

  socket.on('squaresXY', data => {
    socket.broadcast.emit('squaresXY', data);

  });
});