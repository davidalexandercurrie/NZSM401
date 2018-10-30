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
  var userIdSet = new Set();
  var colours = {};






  function setup() {
    createCanvas(1370, 720);
    brightnessThreshold = createSlider(0, 200, 100, 1);
    brightnessThreshold.position(20, 720);

    pixelDensity(1);
    video = createCapture(VIDEO);
    video.size(width / vScale, height / vScale);

    // video.hide();
    socket = io.connect();
    socket.on('squaresXY', dataReceive);
    socket.on('connect', function () {
      socketID = socket.id;
    });

    //sound
    osc = new p5.Oscillator();
    osc.start();
    osc2 = new p5.Oscillator();
    osc2.start();
  }

  function draw() {
    if (counter1 % 18000 == 0) {
      userIdSet.clear();
    }

    counter1++;
    if (counter1 == squares) {
      // console.log(counter1);
      counter1 = 0;

    }


    osc.setType('sine');
    osc.freq(45, 0.1);
    osc2.setType('sine');
    osc2.freq(16000, 0.01);
    osc2.amp(0.2, 0.01);

    if (counter1 % 10 == 0) {
      osc.pan((Math.random() * 2) - 1);
      osc.amp(0, 0.01);

    } else {
      osc.amp(0.5, 0.001);
    }
    if (counter1 % 7 == 0) {
      osc2.pan((Math.random() * 2) - 1);
      osc2.amp(0, 0.01);
    } else {
      osc2.amp(0.5, 0.001);
    }

    if (counter1 % 5 == 0) {
      video.loadPixels();
      oldBright = avgBright;
      avgBright = 0;
      if (counter1 % 2 == 0) {
        squares = 0;
        xSquares = 0;
        ySquares = 0;
        background(255, 1);
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
              xSquares = xSquares + x;
              ySquares = ySquares + y;
              squares++;

            } else {
              fill(179, 255, 179, 100);
            }
            stroke(255);
            rect(width - (x + 1) * vScale, y * vScale, vScale, vScale);
            counter++;
          }
          if (y == video.height - 1) {
            fill(255, 175, 217, 200);
            finalSquares = squares;
            ellipse((xSquares / finalSquares) * vScale, (ySquares / finalSquares) * vScale, squares, squares);
            if (counter1 % 60 == 0) {
              sendData();
              // console.log(userIdSet);
            }
          }
        }

      }

      // console.log("x,y", xSquares, ySquares);


      // console.log(xSquares, "x");
      // console.log(ySquares, "y");
      finalSquares = squares;
      // console.log(finalSquares);
    }

  }

  function dataReceive(data) {
    console.log(data.xSquares);
    console.log(data.ySquares);
    console.log(data.Socket_ID);
    if (!userIdSet.has(data.Socket_ID)) {
      userIdSet.add(data.Socket_ID);
      //create random colour
      //assign to an object as value for user id key
      colours[data.Socket_ID + "r"] = Math.random() * 46;
      colours[data.Socket_ID + "g"] = Math.random() * 255;
      colours[data.Socket_ID + "b"] = Math.random() * 137;


    }

    fill(colours[data.Socket_ID + "r"], colours[data.Socket_ID + "g"], colours[data.Socket_ID + "b"], 200);
    ellipse(data.xSquares, data.ySquares, 30 + (50 / userIdSet.size), 30 + (50 / userIdSet.size));

  }

  function sendData() {
    var data = {
      xSquares: ((xSquares / finalSquares) * vScale),
      ySquares: ((ySquares / finalSquares) * vScale),
      Socket_ID: socketID
    };
    socket.emit('squaresXY', data);
  }