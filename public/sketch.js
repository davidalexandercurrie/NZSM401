var video;
var socket;
var vScale = 16;
var avgBright;
var counter;
var oldBright;
var difference;
var socketID;
var counter = 0;
var freq = 400;
var vol = 0.5;
var receiveVar = 10;
var env = 0;
var volM;
var add;
var lengthSwell = 10000;
var counter1 = 0;

//clock
var clock1 = new maximJs.maxiClock();
clock1.setTempo(120);

var maxiAudio = new maximJs.maxiAudio();
var myWave = new maximJs.maxiOsc();
var myWave2 = new maximJs.maxiOsc();
var myWave3 = new maximJs.maxiOsc();
var myWave4 = new maximJs.maxiOsc();
var myWave5 = new maximJs.maxiOsc();

maxiAudio.init();

maxiAudio.play = function () {
  if (env % lengthSwell === 0) {
    add = 1;
    lengthSwell = Math.random() * 1000 + 5000;
    console.log(lengthSwell, "LENGTHSWELL");
  }
  if (env % lengthSwell === (lengthSwell - 1)) {
    add = -1;
    lengthSwell = Math.random() * 1000 + 5000;
  }
  if (counter1 % 100000 === 0) {
    console.log(env, lengthSwell);
  }
  counter1++;


  env = env + add;
  volM = env / lengthSwell;
  clock1.ticker();
  var synth = myWave5.sawn(receiveVar / 10) * (myWave.sinewave(freq) + myWave2.sinewave(freq * 2) + myWave3.sawn(freq / 2) + myWave4.sawn(300 - freq));
  if (clock1.tick) {
    clock1.setTicksPerBeat(Math.random(1, 10));
    vol = (Math.random() * 0.4) * volM;
  }

  this.output = synth * vol * 0.3;
};

function setup() {
  createCanvas(640, 480);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(width / vScale, height / vScale);

  video.hide();
  socket = io.connect();
  socket.on('bright', dataReceive);
  socket.on('connect', function () {
    socketID = socket.id;
    console.log(socket.id);
  });
}

function draw() {
  counter++;
  if (counter % 5 == 0) {

    video.loadPixels();
    oldBright = avgBright;
    avgBright = 0;
    counter = 0;

    for (var y = 0; y < video.height; y++) {
      for (var x = 0; x < video.width; x++) {
        var index = (x + y * video.width) * 4;
        var r = video.pixels[index + 0];
        var g = video.pixels[index + 1];
        var b = video.pixels[index + 2];

        var bright = (r + g + b) / 3;
        avgBright = avgBright + bright;
        fill(bright);
        rect(width - (x + 1) * vScale, y * vScale, vScale, vScale);
        counter++;
      }
    }
    avgBright = avgBright / counter;
    difference = oldBright - avgBright;

    if (Math.abs(difference) > 0.2) {
      sendData();
      console.log(avgBright);
      updateFreq(avgBright);
    }
  }
}

function dataReceive(data) {
  console.log(data, "received");
  receiveVar = data.avgBrightness;
}

function sendData() {
  //console.log(avgBright);
  var data = {
    avgBrightness: avgBright,
    Socket_ID: socketID
  };
  socket.emit('bright', data);
}

function updateFreq(frequency) {
  freq = frequency;
}