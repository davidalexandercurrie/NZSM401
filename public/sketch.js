//variable declarations
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
var env = 0;
var add;
var counter1 = 0;
var master = 1;
var x = 1;
var oldvideo;
var brightnessThreshold;
var squares;
var finalSquares;
var xSquares;
var ySquares;
var chance;
var osc;
var osc2;
var colours = {};
var xAverage;
var yAverage;
var panning;
var playing = false;
//using this set later to make it easy to see if a client exists already or not by adding its user id to a set
//sets are only able to store one of each value and there is a function to check if a value is already present in a set
var userIdSet = new Set();

var firstOpened = true;

var button;
var canvas;

//p5.js setup function
//general canvas information is created here

function setup() {
  canvas = createCanvas(windowWidth - 20, windowHeight - 50);
  // createCanvas(screenWidth, screenHeight);
  //create html slider element which will be used to control the cutoff brightness for the squares
  brightnessThreshold = createSlider(1, 200, 100, 1);

  //creates the video input and scales it to be very small and then hides it
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(width / vScale, height / vScale);

  video.hide();
  //here is where I set up websocket receive with socket.io
  socket = io.connect();
  socket.on("squaresXY", dataReceive);
  socket.on("connect", function() {
    //assign the user ID to a variable
    socketID = socket.id;
  });
  //sound
  //two oscillators
  osc = new p5.Oscillator();
  osc2 = new p5.Oscillator();
  textSize(40);
  textAlign(CENTER, CENTER);
  text("BEGIN", width / 2, height / 2);

  button = createButton("Start");
  button.hide();
  button.mousePressed(toggleSound);
  button.position(windowWidth / 2, windowHeight - 40);
  brightnessThreshold.position(windowWidth / 8, windowHeight - 40);
  brightnessThreshold.hide();
}

function draw() {
  console.log(firstOpened);
  if (firstOpened === false) {
    // this if statement will reset the userIDSet after 18000 frames which is in case anything weird happens
    if (counter1 % 18000 == 0) {
      userIdSet.clear();
    }
    //using counters to reduce processing required
    counter1++;

    if (counter1 == squares) {
      // console.log(counter1);
      counter1 = 0;
    }
    // setting oscillator data frequencies
    osc.setType("sine");
    osc.freq(45, 0.1);
    osc2.setType("sine");
    osc2.freq(16000, 0.01);
    osc2.amp(0.2, 0.01);
    //lots of modulo conditions to ensure varying rhythmic material
    if (counter1 % 10 == 0) {
      // osc.pan((Math.random() * 2) - 1);
      osc.amp(0, 0.01);
    } else {
      osc.amp(0.4, 0.001);
    }
    if (counter1 % 7 == 0) {
      osc2.pan(Math.random() * 2 - 1);
      osc2.amp(0, 0.01);
    } else {
      osc2.amp(0.5, 0.001);
    }

    ///////// ANNIMATE THE SQUARES
    if (counter1 % 5 == 0) {
      video.loadPixels();
      oldBright = avgBright;
      avgBright = 0;
      if (counter1 % 2 == 0) {
        squares = 0;
        xSquares = 0;
        ySquares = 0;

        // here is where the grid is created
        // based on the video input that was scaled down to be very low resolution
        // the loop steps through the pixel array and looks at the brightness of the pixel
        // and then draws either a dark or light square based on the brightness cutoff set by the slider

        for (var y = 0; y < video.height; y++) {
          for (var x = 0; x < video.width; x++) {
            var index = (x + y * video.width) * 4;
            var r = video.pixels[index + 0];
            var g = video.pixels[index + 1];
            var b = video.pixels[index + 2];
            var bright = (r + g + b) / 3;
            avgBright = avgBright + bright;
            if (bright > brightnessThreshold.value()) {
              fill(214, 211, 240, 50);
            } else {
              fill(11, 49, 66, 50);
              xSquares = xSquares + x;
              ySquares = ySquares + y;
              squares++;
            }
            stroke(255);
            rect(canvas.width - (x + 1) * vScale, y * vScale, vScale, vScale);
            counter++;
          }
          if (y == video.height - 1) {
            fill(15, 82, 87, 150);
            finalSquares = squares;

            xAverage =
              canvas.width - (xSquares / (finalSquares + 0.001)) * vScale - 32;
            yAverage = (ySquares / (finalSquares + 0.001)) * vScale + 32;
            ellipse(xAverage, yAverage, squares + 20, squares + 20);
            panning = map(xAverage, 1, width, -1, 1);

            osc.pan(panning * 1.5, 0.5);

            if (counter1 % 30 == 0) {
              sendData();
              // console.log(userIdSet);
            }
          }
        }
      }
    }
  }
}
// function that gets called when data is being sent to this client from the server
function dataReceive(data) {
  //checks if the user ID exists in the userIdSet already
  //if so assign it a colour
  if (!userIdSet.has(data.Socket_ID)) {
    userIdSet.add(data.Socket_ID);
    //create random colour
    //assign to an object as value for user id key
    var randC = random(0.6, 1.4);
    colours[data.Socket_ID + "r"] = randC * 156;
    colours[data.Socket_ID + "g"] = randC * 146;
    colours[data.Socket_ID + "b"] = randC * 163;
  }
  // colours the circles by the colour assigned to their user ID
  fill(
    colours[data.Socket_ID + "r"],
    colours[data.Socket_ID + "g"],
    colours[data.Socket_ID + "b"],
    200
  );
  ellipse(data.xSquares, data.ySquares, data.squares + 20, data.squares + 20);
}
// packs square data that relates to video input and sends to the server
function sendData() {
  var data = {
    squares: squares,
    xSquares: xAverage,
    ySquares: yAverage,
    Socket_ID: socketID
  };
  socket.emit("squaresXY", data);
}

function toggleSound() {
  if (playing === false) {
    osc.start();
    osc2.start();

    playing = true;
    button.html("Stop");
  } else {
    osc.stop();
    osc2.stop();
    playing = false;
    button.html("Play");
  }
}

function mouseClicked() {
  if (firstOpened === true) {
    firstOpened = false;
    button.show();
    brightnessThreshold.show();
    toggleSound();
  }
}

function windowResized() {
  resizeCanvas(windowWidth - 20, windowHeight - 50);
}
