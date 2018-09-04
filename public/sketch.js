var video;
var socket;
var vScale = 16;
var avgBright;
var counter;
var oldBright;
var difference;


function setup() {
  createCanvas(640, 480);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(width/vScale, height/vScale);

  video.hide();
  socket = io.connect();
}

function draw() {
  background(51);
  video.loadPixels();
  oldBright = avgBright;
  avgBright = 0;
  counter = 0;
  for(var y = 0; y < video.height; y++){
    for(var x = 0; x < video.width; x++){
      var index = (x + y * video.width)*4;
      var r = video.pixels[index+0];
      var g = video.pixels[index+1];
      var b = video.pixels[index+2];

      var bright = (r+g+b)/3;
      avgBright = avgBright + bright;
      fill(bright);
      rect(width-(x+1)*vScale, y*vScale, vScale, vScale);
      counter++;
    }
  }
  avgBright = avgBright/counter;
  difference = oldBright - avgBright;

  if(Math.abs(difference) > 0.1){
    sendAvgBright();
  }

}

function sendAvgBright(){
  console.log(avgBright);
  var data = {
    avgBrightness: avgBright
  }
  socket.emit('bright', data);
}
