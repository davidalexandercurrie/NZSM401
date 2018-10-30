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
  var xAverage;
  var yAverage;
  var panning;






  function setup() {
    createCanvas(1360, 780);
    brightnessThreshold = createSlider(1, 200, 100, 1);
    brightnessThreshold.position(20, 720);

    pixelDensity(1);
    video = createCapture(VIDEO);
    video.size(width / vScale, height / vScale);

    video.hide();
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
      // osc.pan((Math.random() * 2) - 1);
      osc.amp(0, 0.01);

    } else {
      osc.amp(0.4, 0.001);
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
        // background(255, 1);
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
            rect(width - (x + 1) * vScale, y * vScale, vScale, vScale);
            counter++;
          }
          if (y == video.height - 1) {
            fill(15, 82, 87, 150);
            finalSquares = squares;
            // console.log(squares, xSquares, ySquares);
            xAverage = width - ((xSquares / (finalSquares + 0.001)) * vScale) - 32;
            yAverage = ((ySquares / (finalSquares + 0.001)) * vScale) + 32;
            ellipse(xAverage, yAverage, squares + 20, squares + 20);
            panning = map(xAverage, 1, width, -1, 1);
            // console.log(panning);
            osc.pan(panning * 1.5, 0.5);

            if (counter1 % 30 == 0) {
              sendData();
              // console.log(userIdSet);
            }
          }
        }

      }

      // console.log("x,y", xSquares, ySquares);


      // console.log(xSquares, "x");
      // console.log(ySquares, "y");

      // console.log(finalSquares);
    }

  }

  function dataReceive(data) {
    // console.log(data.xSquares);
    // console.log(data.ySquares);
    // console.log(data.Socket_ID);
    if (!userIdSet.has(data.Socket_ID)) {
      userIdSet.add(data.Socket_ID);
      //create random colour
      //assign to an object as value for user id key
      var randC = random(0.6, 1.4);
      colours[data.Socket_ID + "r"] = randC * 156;
      colours[data.Socket_ID + "g"] = randC * 146;
      colours[data.Socket_ID + "b"] = randC * 163;
      //(156,146,163)
    }
    fill(colours[data.Socket_ID + "r"], colours[data.Socket_ID + "g"], colours[data.Socket_ID + "b"], 200);
    ellipse(data.xSquares, data.ySquares, data.squares + 20, data.squares + 20);
  }

  function sendData() {
    var data = {
      squares: squares,
      xSquares: xAverage,
      ySquares: yAverage,
      Socket_ID: socketID
    };
    socket.emit('squaresXY', data);
  }