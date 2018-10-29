var video;
var socket;
var vScale = 64;
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
var oldvideo;
var brightnessThreshold;
var squares;
var finalSquares;
var synth = 0;
var synth2 = 0;
var chance;


//clock
var clock1 = new maximJs.maxiClock();
var clock2 = new maximJs.maxiClock();
var clock3 = new maximJs.maxiClock();
clock1.setTempo(1000);
clock1.setTicksPerBeat(4);
clock2.setTempo(1200);
clock2.setTicksPerBeat(9);
clock3.setTempo(120);
clock3.setTicksPerBeat(1);

var maxiAudio = new maximJs.maxiAudio();
var myWave = new maximJs.maxiOsc();
var myWave2 = new maximJs.maxiOsc();
var myWave3 = new maximJs.maxiOsc();
var myWave4 = new maximJs.maxiOsc();
var myWave5 = new maximJs.maxiOsc();
var timer = new maximJs.maxiOsc();
var myFilter = new maximJs.maxiFilter();

maxiAudio.init();

maxiAudio.play = function () {
  clock1.ticker();
  clock2.ticker();
  clock3.ticker();



  if (chance < 0.001) {
    clock1.setTempo(1);
    clock2.setTempo(1);
  } else {
    clock1.setTempo(1000);
    clock2.setTempo(1000);
  }

  if (clock1.tick || counter1 % 10 == 0) {
    chance = Math.random();
    counter1 = timer.phasor(8);
    synth = myWave3.sawn(30);
    synth2 = (myWave.sinewave(60) + myWave2.sinewave(58)) * 0.1;
    clock1.setTicksPerBeat(8);
    clock1.setTempo(2000);
    clock2.setTempo(2000);
  } else {
    synth = myWave3.sinewave(30) * 0.01;
    synth2 = 0;
    clock1.setTempo(20);
    clock2.setTempo(300);
  }
  if (counter1 % 4 == 1 || counter1 % 8 == 3 || counter1 % 7 == 2) {
    synth = myWave3.sinewave(squares * (Math.random() + 1) * myWave4.sawn(Math.random() * 100)) * 0.5;
    clock1.setTempo(Math.random() * 5000);
    clock2.setTempo(200);
  } else if (counter1 % 8 == 4 || counter1 % 16 == 2 || squares % 10 == 0 || squares % 5 == 2) {
    synth2 = (myWave.sawn(squares * 2) + myWave2.sawn(squares * 3) + myWave.sawn(squares / 2)) * 0.025;
    clock1.setTempo(Math.random() * 1000);
    clock2.setTempo(Math.random() * 1000);
  } else {
    synth = (myWave3.sinewave(720 * 2) + (myWave3.sinewave(720 * 8) * 0.5)) * 0.01;
    synth2 = (myWave.sawn(59 * 128) + myWave2.sawn(179 * 128)) * 0.025;
    clock1.setTempo(Math.random() * 1000);
    clock2.setTempo(Math.random() * 1000);
  }
  if (clock2.tick) {
    synth = myWave.sawn(counter1 * 10);
    clock1.setTempo(Math.random() * 10);
    clock2.setTempo(Math.random() * 10);
  }

  this.output = synth + synth2;
};

function setup() {
  createCanvas(1370, 480 * 1.5);
  brightnessThreshold = createSlider(0, 200, 100, 1);
  brightnessThreshold.position(20, 720);


  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(width / vScale, height / vScale);


  video.hide();
  socket = io.connect();
  socket.on('bright', dataReceive);
  socket.on('connect', function () {
    socketID = socket.id;

  });
}

function draw() {
  counter++;
  squares = 0;
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
        if (bright > brightnessThreshold.value()) {
          fill(128, 135, 130, 50);
        } else {
          fill(179, 255, 179, 100);
          squares++;
        }
        stroke(255);
        rect(width - (x + 1) * vScale, y * vScale, vScale, vScale);


        counter++;
      }
    }
    finalSquares = squares;
    // console.log(finalSquares);
    avgBright = avgBright / counter;
    difference = oldBright - avgBright;



    if (Math.abs(difference) > 0.1) {
      sendData();

      updateFreq(avgBright);
    }
  }
  // for (var i = 0; i < video.pixels.length / 4; i++) {
  //   console.log(i);
  // }
  oldvideo = video.pixels.slice(0);

}

function dataReceive(data) {

  receiveVar = (data.avgBrightness / 2);
  clock1.setTempo(receiveVar / 2);

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
  // console.log(freq, "FREQ");
}