var request = require("request");
var RaspiCam = require("raspicam");
var fs = require("fs");
var path = require("path");
const say = require("say");
const gpioComponent = require("./gpioComponent.js");

var camera = new RaspiCam({
  mode: "photo",
  output: "./output.jpg",
  timeout: "0",

});

var predictImageUrl =
  "https://waseai.azurewebsites.net/api/Classification/PredictImage";

var currentResult = null;

camera.on("read", function (err, timestamp, filename) {
  var imagePath = path.join(__dirname, filename);
  if (fs.existsSync(imagePath)) {
    console.log("Sending image to server. Please be patient.")
    say.speak("Sending image to server. Please be patient.");
    var r = request.post(predictImageUrl, {}, function callback(
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
      fs.unlink(imagePath, function () { });
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
        gpioComponent.paperLed.write(0, () => { });
        console.log(binName + " " + binColor);
        break;
      case "Bin2":
        binColor = "grey";
        binLabel = "metal or plastic";
        gpioComponent.plasticLed.write(0, () => { });
        console.log(binName + " " + binColor);
        break;
      case "Bin3":
        binColor = "white";
        binLabel = "other";
        gpioComponent.otherLed.write(0, () => { });
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
    say.speak(audio, null, null, function () {
      isDetectedSpeechFinished = true;
    });
  }
}

testLED();
// triggerButtonLed(true);

var operationStarted = false;
var isDetectedSpeechFinished = false;

gpioComponent.button1.watch(triggerCamera);
gpioComponent.button2.watch(triggerCamera);
gpioComponent.button3.watch(triggerCamera);
gpioComponent.button4.watch(triggerCamera);

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
      gpioComponent.button1Led.writeSync(gpioComponent.button1Led.readSync() ^ 1);
    }, 200);

    interval2 = setInterval(() => {
      gpioComponent.button2Led.writeSync(gpioComponent.button2Led.readSync() ^ 1);
    }, 200);

    interval3 = setInterval(() => {
      gpioComponent.button3Led.writeSync(gpioComponent.button3Led.readSync() ^ 1);
    }, 200);

    interval4 = setInterval(() => {
      gpioComponent.button4Led.writeSync(gpioComponent.button4Led.readSync() ^ 1);
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

gpioComponent.sensor1.watch(function (err, value) {
  console.log("sensor1 = " + value);
  if (value == 1) validateCurrentWaste("sensor1");
});

gpioComponent.sensor2.watch(function (err, value) {
  console.log("sensor2 = " + value);
  if (value == 1) validateCurrentWaste("sensor2");
});

gpioComponent.sensor3.watch(function (err, value) {
  console.log("sensor3 = " + value);
  if (value == 1) validateCurrentWaste("sensor3");
});

function testLED() {
  const iv = setInterval(() => {
    gpioComponent.paperLed.writeSync(gpioComponent.paperLed.readSync() ^ 1);
    gpioComponent.plasticLed.writeSync(gpioComponent.plasticLed.readSync() ^ 1);
    gpioComponent.otherLed.writeSync(gpioComponent.otherLed.readSync() ^ 1);
  }, 200);
  // Stop blinking the LED and turn it off after 3 seconds
  setTimeout(() => {
    clearInterval(iv); // Stop blinking
    reset();
  }, 3000);
  say.speak("Hi, My name is wa seh A I");
}

function reset() {
  gpioComponent.paperLed.write(1, () => { });
  gpioComponent.plasticLed.write(1, () => { });
  gpioComponent.otherLed.write(1, () => { });
  currentResult = null;
}

process.on("SIGINT", function () {
  gpioComponent.paperLed.unexport();
  gpioComponent.plasticLed.unexport();
  gpioComponent.otherLed.unexport();
});
