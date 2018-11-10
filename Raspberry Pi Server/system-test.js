var request = require("request");
var RaspiCam = require("raspicam");
var fs = require("fs");
var path = require("path");
const say = require("say");
var gpio = require("onoff").Gpio;
//constant
var paperLedGpio = 10,
  plasticLedGpio = 9,
  otherLedGpio = 11;
var paperSensorGpio = 17,
  plasticSensorGpio = 27,
  otherSensorGpio = 22;
var button1Gpio = 6,
  button2Gpio = 13,
  button3Gpio = 19,
  button4Gpio = 26;

var camera = new RaspiCam({
  mode: "photo",
  output: "./output.jpg",
  timeout: "100"
});
camera.start();
camera.on(
  "read",
  function (err, timestamp, filename) {
    var imagePath = path.join(__dirname, "output.jpg");
    if (fs.existsSync(imagePath)) {
      say.speak("Image read success.");
      // fs.unlink(imagePath, function() {});
    }
  },
  function (err) {
    console.log(err);
  }
);

// //pir
var paperLed = new gpio(paperLedGpio, "out");
var plasticLed = new gpio(plasticLedGpio, "out");
var otherLed = new gpio(otherLedGpio, "out");

var sensor1 = new gpio(paperSensorGpio, "in", "rising", {
  debounceTimeout: 500
});
var sensor2 = new gpio(plasticSensorGpio, "in", "rising", {
  debounceTimeout: 500
});
var sensor3 = new gpio(otherSensorGpio, "in", "rising", {
  debounceTimeout: 500
});

const button1 = new gpio(button1Gpio, "in", "rising", {
  debounceTimeout: 10
});
const button2 = new gpio(button2Gpio, "in", "rising", {
  debounceTimeout: 10
});
const button3 = new gpio(button3Gpio, "in", "rising", {
  debounceTimeout: 10
});
const button4 = new gpio(button4Gpio, "in", "rising", {
  debounceTimeout: 10
});

testLED();
button1.watch((err, value) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Button 1 pressed " + value);
    camera.start();
  }
});

button2.watch((err, value) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Button 2 pressed " + value);
    camera.start();
  }
});

button3.watch((err, value) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Button 3 pressed " + value);
    camera.start();
  }
});

button4.watch((err, value) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Button 4 pressed " + value);
    camera.start();
  }
});

sensor1.watch(function (err, value) {
  say.speak("Sensor 1 triggered");
});

sensor2.watch(function (err, value) {
  say.speak("Sensor 2 triggered");
});

sensor3.watch(function (err, value) {
  say.speak("Sensor 3 triggered");
});

function testLED() {
  paperLed.writeSync(paperLed.readSync() ^ 1);
  plasticLed.writeSync(plasticLed.readSync() ^ 1);
  otherLed.writeSync(otherLed.readSync() ^ 1);
  paperLed.writeSync(paperLed.readSync() ^ 1);
  plasticLed.writeSync(plasticLed.readSync() ^ 1);
  otherLed.writeSync(otherLed.readSync() ^ 1);
  paperLed.writeSync(paperLed.readSync() ^ 1);
  plasticLed.writeSync(plasticLed.readSync() ^ 1);
  otherLed.writeSync(otherLed.readSync() ^ 1);
  say.speak("Hi, My name is wa seh A I");
}

// function reset() {
//   paperLed.write(0, function() {});
//   plasticLed.write(0, function() {});
//   otherLed.write(0, function() {});
//   currentResult = null;
// }

// process.on("SIGINT", function() {
//   paperLed.unexport();
//   plasticLed.unexport();
//   otherLed.unexport();
//   successLed.unexport();
//   failedLed.unexport();
// });
