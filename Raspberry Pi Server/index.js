//camera
var request = require("request");
var RaspiCam = require("raspicam");
var fs = require("fs");
var path = require("path");
const say = require("say");
var gpio = require("onoff").Gpio;
//constant
var predictImageUrl = "https://wa-se-ai-api.azurewebsites.net/api/Classification/PredictImage";
var paperLedGpio = 27, plasticLedGpio = 22, otherLedGpio = 10, successLedGpio = 9, failedLedGpio = 11;
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
                                paperLed.write(1, function () { });
                                console.log(binName + " " + binColor);
                                break;
                            case "Bin2":
                                binColor = "orange";
                                binLabel = "metal or plastic";
                                plasticLed.write(1, function () { });
                                console.log(binName + " " + binColor);
                                break;
                            case "Bin3":
                                binColor = "brown";
                                binLabel = "other";
                                otherLed.write(1, function () { });
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
var paperLed = new gpio(paperLedGpio, "high");
var plasticLed = new gpio(plasticLedGpio, "high");
var otherLed = new gpio(otherLedGpio, "high");
var successLed = new gpio(successLedGpio, "high");
var failedLed = new gpio(failedLedGpio, "high");

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
        paperLed.writeSync(paperLed.readSync() ^ 1);
        plasticLed.writeSync(plasticLed.readSync() ^ 1);
        otherLed.writeSync(otherLed.readSync() ^ 1);
        successLed.writeSync(successLed.readSync() ^ 1);
        failedLed.writeSync(failedLed.readSync() ^ 1);
    }, 200);
    // Stop blinking the LED and turn it off after 5 seconds
    setTimeout(() => {
        clearInterval(iv); // Stop blinking
        paperLed.write(0, function () { });
        plasticLed.write(0, function () { });
        otherLed.write(0, function () { });
        successLed.write(0, function () { });
        failedLed.write(0, function () { });
    }, 3000);
    say.speak("Press button to begin scanning.");
}

function flashLed(isCorrectBin) {
    const iv = setInterval(() => {
        isCorrectBin
            ? successLed.write(1, function () { })
            : failedLed.writeSync(1, function () { });
    }, 200);
    // Stop blinking the LED and turn it off after 3 seconds
    setTimeout(() => {
        clearInterval(iv); // Stop blinking
        isCorrectBin
            ? successLed.write(0, function () { })
            : failedLed.writeSync(0, function () { });
    }, 3000);
}

function reset() {
    paperLed.write(0, function () { });
    plasticLed.write(0, function () { });
    otherLed.write(0, function () { });
    successLed.write(0, function () { });
    failedLed.write(0, function () { });
    currentResult = null;
}

process.on("SIGINT", function () {
    paperLed.unexport();
    plasticLed.unexport();
    otherLed.unexport();
    successLed.unexport();
    failedLed.unexport();
});