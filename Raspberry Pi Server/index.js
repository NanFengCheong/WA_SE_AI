var request = require("request");
var RaspiCam = require("raspicam");
var fs = require("fs");
var path = require("path");
const say = require("say");
var gpio = require("onoff").Gpio;

//constant
const paperLedGpio = 10,
  plasticLedGpio = 9,
  otherLedGpio = 11;
const paperSensorGpio = 17,
  plasticSensorGpio = 27,
  otherSensorGpio = 22;
const button1Gpio = 6,
  button2Gpio = 13,
  button3Gpio = 19,
  button4Gpio = 26;
const button1LedGpio = 12,
  button2LedGpio = 16,
  button3LedGpio = 20,
  button4LedGpio = 21;

const paperLed = new gpio(paperLedGpio, "out");
const plasticLed = new gpio(plasticLedGpio, "out");
const otherLed = new gpio(otherLedGpio, "out");
const button1Led = new gpio(button1LedGpio, "high");
const button2Led = new gpio(button2LedGpio, "high");
const button3Led = new gpio(button3LedGpio, "high");
const button4Led = new gpio(button4LedGpio, "high");

const sensor1 = new gpio(paperSensorGpio, "in", "rising", {
  debounceTimeout: 500
});
const sensor2 = new gpio(plasticSensorGpio, "in", "rising", {
  debounceTimeout: 500
});
const sensor3 = new gpio(otherSensorGpio, "in", "rising", {
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

var camera = new RaspiCam({
  mode: "photo",
  output: "./output.jpg",
  timeout: "100"
});

var predictImageUrl =
  "http://192.168.43.228:5000/api/Classification/PredictImage";

var currentResult = null;

camera.on("read", function(err, timestamp, filename) {
  var imagePath = path.join(__dirname, "output.jpg");
  if (fs.existsSync(imagePath)) {
    say.speak("Sending image to server. Please be patient.");
    var r = request.post(predictImageUrl, function callback(
      err,
      httpResponse,
      body
    ) {
      if (err) {
        // say.speak("Something wrong with server");
        return console.error("upload failed:", err);
      } else {
        processResult(body);
      }
      fs.unlink(imagePath, function() {});
    });
    var form = r.form();
    form.append("formFile", fs.createReadStream(imagePath));
  }
});

function processResult(body) {
  console.log("Server responded with:", body.toString());
  currentResult = JSON.parse(body);
  //get audio
  var audio = null;
  if (currentResult != null && currentResult.tag != null) {
    var recycleType = currentResult.tag.description.split("@")[0];
    var binName = currentResult.tag.description.split("@")[1];
    var binColor = "";
    var binLabel = "";
    switch (binName) {
      case "Bin1":
        binColor = "black";
        binLabel = "paper";
        paperLed.write(0, () => {});
        console.log(binName + " " + binColor);
        break;
      case "Bin2":
        binColor = "grey";
        binLabel = "metal or plastic";
        plasticLed.write(0, () => {});
        console.log(binName + " " + binColor);
        break;
      case "Bin3":
        binColor = "white";
        binLabel = "other";
        otherLed.write(0, () => {});
        console.log(binName + " " + binColor);
        break;
      default:
        break;
    }

    audio =
      currentResult.tag.name +
      " recognized. It is classified as " +
      recycleType +
      ". Please proceed to throw it in " +
      binColor +
      " color bin labelled as " +
      binLabel;
  }

  if (audio != null) {
    console.log(audio);
    say.speak(audio, null, null, function() {
      isDetectedSpeechFinished = true;
    });
  }
}

testLED();
// triggerButtonLed(true);

var operationStarted = false;
var isDetectedSpeechFinished = false;

button1.watch(triggerCamera);
button2.watch(triggerCamera);
button3.watch(triggerCamera);
button4.watch(triggerCamera);

function triggerCamera(err, value) {
  if (err) {
    console.log(err);
  } else {
    if (!operationStarted) {
      operationStarted = true;
      console.log("Button pressed " + value);
      reset();
      camera.start();
    }
  }
}

function triggerButtonLed(enable) {
  let interval1, interval2, interval3, interval4;
  if (enable) {
    interval1 = setInterval(() => {
      button1Led.writeSync(button1Led.readSync() ^ 1);
    }, 200);

    interval2 = setInterval(() => {
      button2Led.writeSync(button2Led.readSync() ^ 1);
    }, 200);

    interval3 = setInterval(() => {
      button3Led.writeSync(button3Led.readSync() ^ 1);
    }, 200);

    interval4 = setInterval(() => {
      button4Led.writeSync(button4Led.readSync() ^ 1);
    }, 200);
  } else {
    clearInterval(interval1);
    clearInterval(interval2);
    clearInterval(interval3);
    clearInterval(interval4);
  }
}

function validateCurrentWaste(sensorName) {
  if (currentResult && currentResult.tag != null && isDetectedSpeechFinished) {
    var binName = currentResult.tag.description.split("@")[1];
    if (sensorName == "sensor1" && binName != "Bin1") {
      console.log("Incorrect Bin: " + sensorName + " " + binName);
      // flashLed(false);
      say.speak(
        "Unfortunately You throw it in the wrong bin, please try harder next time."
      );
    } else if (sensorName == "sensor2" && binName != "Bin2") {
      console.log("Incorrect Bin: " + sensorName + " " + binName);
      // flashLed(false);
      say.speak("You throw it in the wrong bin, please try harder next time.");
    } else if (sensorName == "sensor3" && binName != "Bin3") {
      console.log("Incorrect Bin: " + sensorName + " " + binName);
      // flashLed(false);
      say.speak("You throw it in the wrong bin, please try harder next time.");
    } else {
      console.log("Correct Bin");
      // flashLed(true);
      say.speak("You throw it in the correct bin, well done.");
    }
    reset();
    operationStarted = false;
  }
}

sensor1.watch(function(err, value) {
  console.log("sensor1 = " + value);
  if (value == 1) validateCurrentWaste("sensor1");
});

sensor2.watch(function(err, value) {
  console.log("sensor2 = " + value);
  if (value == 1) validateCurrentWaste("sensor2");
});

sensor3.watch(function(err, value) {
  console.log("sensor3 = " + value);
  if (value == 1) validateCurrentWaste("sensor3");
});

function testLED() {
  const iv = setInterval(() => {
    paperLed.writeSync(paperLed.readSync() ^ 1);
    plasticLed.writeSync(plasticLed.readSync() ^ 1);
    otherLed.writeSync(otherLed.readSync() ^ 1);
  }, 200);
  // Stop blinking the LED and turn it off after 3 seconds
  setTimeout(() => {
    clearInterval(iv); // Stop blinking
    reset();
  }, 3000);
  say.speak("Hi, My name is wa seh A I");
}

function reset() {
  paperLed.write(1, () => {});
  plasticLed.write(1, () => {});
  otherLed.write(1, () => {});
  currentResult = null;
}

process.on("SIGINT", function() {
  paperLed.unexport();
  plasticLed.unexport();
  otherLed.unexport();
});