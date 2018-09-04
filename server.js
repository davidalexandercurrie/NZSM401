var express = require('express');
var socket = require('socket.io');
var path = require('path');
var socketID;

var app = express();
var server = app.listen(process.env.PORT || 3000, process.env.IP, function(){
  console.log("My socket server is running");
})
var io = socket(server);

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', newConnection);

function newConnection(socket) {
  console.log('new connection: ' + socket.id);
  socket.on('bright', cameraMsg);
  socketID = socket.id;
}
function cameraMsg(data, socketID){
  console.log(data, socketID);
}
