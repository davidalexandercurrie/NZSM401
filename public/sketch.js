var video;
var socket;
var vScale = 16;

function setup() {
  createCanvas(640, 480);
  pixelDensity(1);
  video = createCapture(VIDEO);

  video.size(width/vScale, height/vScale);
  video.hide();
  socket = io.connect('process.env.PORT || 3000, process.env.IP');
}

function draw() {
video.loadPixels();
loadPixels();
for(var y = 0; y < video.height; y++){
  for(var x = 0; x < video.width; x++){
    var index = (x + y * video.width)*4;
    var r = video.pixels[index+0];
    var g = video.pixels[index+1];
    var b = video.pixels[index+2];

    var bright = (r+g+b)/3;
    fill(bright);
    rect(width-(x+1)*vScale, y*vScale, vScale, vScale);


  }
}

}
