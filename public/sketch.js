var video;
var socket;
var vScale = 16;
var avgBright;
var counter;
var oldBright;
var difference;
var socketID;
var counter = 0;
var freq = 20;
var vol = 0.5;
var receiveVar = 10;
var env = 0;
var volM;
var add;
var lengthSwell = 10000;
var counter1 = 0;
var master = 1;
var x = 1;

//clock
var clock1 = new maximJs.maxiClock();
clock1.setTempo(90);
clock1.setTicksPerBeat(16);

var maxiAudio = new maximJs.maxiAudio();
var myWave = new maximJs.maxiOsc();
var myWave2 = new maximJs.maxiOsc();
var myWave3 = new maximJs.maxiOsc();
var myWave4 = new maximJs.maxiOsc();
var myWave5 = new maximJs.maxiOsc();

maxiAudio.init();

maxiAudio.play = function () {

  counter1++;



  clock1.ticker();
  var synth = myWave3.sinewave(freq * 400) * 0.2;

  var beat = Math.floor((Math.random() * 15) + 1);
  var tempoSetter = Math.floor((Math.random() * 100) + 60);
  if (clock1.tick) {

    if (counter % beat === 0) {
      master = 1;
      clock1.setTempo(tempoSetter);
      synth = myWave5.square(receiveVar / 100) * ((myWave.sawn(freq / 2) + myWave2.sawn(60) + (myWave3.sinewave(freq * 200) * 0.3) + (myWave4.sinewave(30) * 0.2)));
    } else if (counter % beat === 4) {
      master = 1;
      synth = myWave3.sinewave(10);
    } else {
      master = 0;
    }
  }

  this.output = synth * 0.05 * master;
};

function setup() {
  createCanvas(640, 480);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(width / vScale, height / vScale);

  // video.hide();
  socket = io.connect();
  socket.on('bright', dataReceive);
  socket.on('connect', function () {
    socketID = socket.id;

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

    if (Math.abs(difference) > 0.1) {
      sendData();

      updateFreq(avgBright);
    }
  }
}

function dataReceive(data) {

  receiveVar = (data.avgBrightness / 2);
  clock1.setTempo(receiveVar * 4);

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
  if (freq > (frequency + 20)) {
    freq -= 0.001;
  } else {
    freq += 0.001;
  }
  console.log(freq, "FREQ");
}