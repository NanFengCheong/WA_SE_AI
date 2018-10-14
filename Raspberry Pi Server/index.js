//camera
var request = require("request");
var RaspiCam = require("raspicam");
var fs = require("fs");
var path = require("path");
const say = require("say");

//constant
var predictImageUrl = "https://wa-se-ai-api.azurewebsites.net/api/Classification/PredictImage";
var paperLedGpio = 27, plasticLedGpio = 22, otherLedGpio = 10, correctLedGpio = 9, failedLedGpio = 11;
var paperSensorGpio = 14, plasticSensorGpio = 15, otherSensorGpio = 18;
var buttonGpio = 23;

var camera = new RaspiCam({
    mode: "photo",
    output: "./output.jpg",
    timeout: "100"
});

var currentResult = null;
testLED();

camera.on("read", function (err, timestamp, filename) {
    var imagePath = path.join(__dirname, "output.jpg");
    if (fs.existsSync(imagePath)) {
        say.speak("Sending image to server for processing. Please be patient.");
        var r = request.post(predictImageUrl,
            function callback(err, httpResponse, body) {
                if (err) {
                    // say.speak("Something wrong with server");
                    return console.error("upload failed:", err);
                } else {
                    console.log("Server responded with:", body);
                    currentResult = JSON.parse(body);
                    //   {"predictionModel":{"probability":0.999997258,"tagId":"1466abb7-0c60-4739-8440-d74cba80121c","tagName":"Plastic Bottle","boundingBox":null},"tag":{"id":"1466abb7-0c60-4739-8440-d74cba80121c","name":"Plastic Bottle","description":"Recyclable-Plastic@Bin2","imageCount":30}}
                    //get audio
                    var audio = null;
                    if (currentResult != null && currentResult.tag != null) {
                        var recycleType = currentResult.tag.description.split("@")[0];
                        var binName = currentResult.tag.description.split("@")[1];
                        var binColor = "";
                        var binLabel = "";
                        switch (binName) {
                            case "Bin1":
                                binColor = "blue";
                                binLabel = "paper";
                                led1.write(1, function () { });
                                console.log(binName + " " + binColor);
                                break;
                            case "Bin2":
                                binColor = "orange";
                                binLabel = "metal or plastic";
                                led2.write(1, function () { });
                                console.log(binName + " " + binColor);
                                break;
                            case "Bin3":
                                binColor = "brown";
                                binLabel = "other";
                                led3.write(1, function () { });
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
                fs.unlink(imagePath, function () { });
            }
        );
        var form = r.form();
        form.append("formFile", fs.createReadStream(imagePath));
    }
});

//pir
var gpio = require("onoff").Gpio;

var led1 = new gpio(paperLedGpio, "high");
var led2 = new gpio(plasticLedGpio, "high");
var led3 = new gpio(otherLedGpio, "high");
var ledGreen = new gpio(correctLedGpio, "high");
var ledRed = new gpio(failedLedGpio, "high");

var sensor1 = new gpio(paperSensorGpio, "in", "both");
var sensor2 = new gpio(plasticSensorGpio, "in", "both");
var sensor3 = new gpio(otherSensorGpio, "in", "both");

const button = new gpio(buttonGpio, "in", "both");

var operationStarted = false;
var isDetectedSpeechFinished = false;

button.watch((err, value) => {
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
});

function validateCurrentWaste(sensorName) {
    console.log("isDetectedSpeechFinished: " + isDetectedSpeechFinished);
    if (currentResult && currentResult.tag != null && isDetectedSpeechFinished) {
        var binName = currentResult.tag.description.split("@")[1];
        if (sensorName == "sensor1" && binName != "Bin1") {
            console.log("Incorrect Bin: " + sensorName + " " + binName);
            flashLed(false);
            say.speak("You throw it in the wrong bin, please try harder next time.");
        } else if (sensorName == "sensor2" && binName != "Bin2") {
            console.log("Incorrect Bin: " + sensorName + " " + binName);
            flashLed(false);
            say.speak("You throw it in the wrong bin, please try harder next time.");
        } else if (sensorName == "sensor3" && binName != "Bin3") {
            console.log("Incorrect Bin: " + sensorName + " " + binName);
            flashLed(false);
            say.speak("You throw it in the wrong bin, please try harder next time.");
        } else {
            console.log("Correct Bin");
            flashLed(true);
            say.speak("You throw it in the correct bin, well done.");
        }
        reset();
        operationStarted = false;
    }
}

sensor1.watch(function (err, value) {
    console.log("sensor1 = " + value);
    if (value == 1) validateCurrentWaste("sensor1");
    //trigger m2x
});

sensor2.watch(function (err, value) {
    console.log("sensor2 = " + value);
    if (value == 1) validateCurrentWaste("sensor2");
    //trigger m2x
});

sensor3.watch(function (err, value) {
    console.log("sensor3 = " + value);
    if (value == 1) validateCurrentWaste("sensor3");
    //trigger m2x
});

function testLED() {
    const iv = setInterval(() => {
        led1.writeSync(led1.readSync() ^ 1);
        led2.writeSync(led2.readSync() ^ 1);
        led3.writeSync(led3.readSync() ^ 1);
        ledGreen.writeSync(ledGreen.readSync() ^ 1);
        ledRed.writeSync(ledRed.readSync() ^ 1);
    }, 200);
    // Stop blinking the LED and turn it off after 5 seconds
    setTimeout(() => {
        clearInterval(iv); // Stop blinking
        led1.write(0, function () { });
        led2.write(0, function () { });
        led3.write(0, function () { });
        ledGreen.write(0, function () { });
        ledRed.write(0, function () { });
    }, 3000);
    say.speak("Press button to begin scanning.");
}

function flashLed(isCorrectBin) {
    const iv = setInterval(() => {
        isCorrectBin
            ? ledGreen.write(1, function () { })
            : ledRed.writeSync(1, function () { });
    }, 200);
    // Stop blinking the LED and turn it off after 5 seconds
    setTimeout(() => {
        clearInterval(iv); // Stop blinking
        isCorrectBin
            ? ledGreen.write(0, function () { })
            : ledRed.writeSync(0, function () { });
    }, 3000);
}

function reset() {
    led1.write(0, function () { });
    led2.write(0, function () { });
    led3.write(0, function () { });
    ledGreen.write(0, function () { });
    ledRed.write(0, function () { });
    currentResult = null;
}

process.on("SIGINT", function () {
    led1.unexport();
    led2.unexport();
    led3.unexport();
    ledGreen.unexport();
    ledRed.unexport();
});

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
// function waitingWaste() {
//   // Checks if waste is put in the correct bins - [6]
//   if (sensor2 == false && sensor3 == false && sensor3 == false) {
//     waitLED = false;
//     // Play audio - Thanks
//   } else {
//     if (sensor2 == LED1) {
//       greenLED = true;
//       redLED = false;

//       sensor2 = false;
//     } else if (sensor3 == LED2) {
//       greenLED = true;
//       redLED = false;

//       sensor3 = false;
//     } else if (sensor3 == LED3) {
//       greenLED = true;
//       redLED = false;

//       sensor3 = false;
//     } else {
//       greenLED = false;
//       redLED = true;
//     }
//     setTimeout(waitingWaste, 1000);
//   }
// }
