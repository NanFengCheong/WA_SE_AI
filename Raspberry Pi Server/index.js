//camera
var request = require("request");
var RaspiCam = require("raspicam");
var fs = require("fs");
var path = require("path");
const say = require("say");

var camera = new RaspiCam({
  mode: "photo",
  output: "./output.jpg",
  timeout: "100"
});

camera.on("read", function(err, timestamp, filename) {
  console.log(arguments);
  var imagePath = path.join(__dirname, "output.jpg");
  var r = request.post(
    "https://wa-se-ai-api.azurewebsites.net/api/Classification/PredictImage",
    function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error("upload failed:", err);
      }
      console.log("Upload successful!  Server responded with:", body);
      fs.unlinkSync(imagePath);

      say.speak("Upload successful!  Server responded with");
    }
  );
  var form = r.form();
  form.append("formFile", fs.createReadStream(imagePath));
});

//pir
var gpio = require("onoff").Gpio;

var led1 = new gpio(17, "out");
var led2 = new gpio(27, "out");
var led3 = new gpio(22, "out");
var ledGreen = new gpio(10, "out");
var ledRed = new gpio(9, "out");

var sensor0 = new gpio(14, "in", "both");
var sensor1 = new gpio(15, "in", "both");
var sensor2 = new gpio(18, "in", "both");
var sensor3 = new gpio(23, "in", "both");

sensor0.watch(function(err, value) {
  camera.start();
});

// // Loop sensor every sec

// (function main() {

//     reset();

//     // Sensor below camera detects movement [2]
//     if (sensor0) {
//         cameraAPI();
//         sensor0 = false;
//     }
//     setTimeout(main, 1000); // [1]
// })();

(function reset() {
  led1.write(0);
  led2.write(0);
  led3.write(0);
  ledGreen.write(0);
  ledRed.write(0);
})();

// // API Processing - set LED
// (function cameraAPI() {
//     var result = 0; // 0- Not identified; 1- Paper; 2-Metal/Plastic ; 3-Other (General Waste)

//     apiLED = true;

//     // Capture image with camera then create POST request [3]

//     // reply [4]
//     apiLED = false;

//     if (result == 0) {
//         // Result is failed to identify
//         errorLED = true;
//     } else {
//         LED1 = false;
//         LED2 = false;
//         LED3 = false;

//         // Play audio [5]
//         audio = true;

//         if (result == 1) {
//             LED1 = true;
//         }

//         if (result == 2) {
//             LED2 = true;
//         }

//         if (result == 3) {
//             LED3 = true;
//         }

//         waitLED = true;
//         waitingWaste();
//         setTimeout(reset, 15000); // [5-6]
//     }
// })();

// // Trigger Camera
// (function waitingWaste() {
//     // Checks if waste is put in the correct bins - [6]
//     if (sensor1 == false && sensor2 == false && sensor3 == false) {
//         waitLED = false;
//         // Play audio - Thanks
//     } else {
//         if (sensor1 == LED1) {
//             greenLED = true;
//             redLED = false;

//             sensor1 = false;
//         } else if (sensor2 == LED2) {
//             greenLED = true;
//             redLED = false;

//             sensor2 = false;
//         } else if (sensor3 == LED3) {
//             greenLED = true;
//             redLED = false;

//             sensor3 = false;
//         } else {
//             greenLED = false;
//             redLED = true;
//         }
//         setTimeout(waitingWaste, 1000);
//     }
// })();
