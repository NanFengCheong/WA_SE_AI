var sensor0 = false;

var sensor1 = false;
var sensor2 = false;
var sensor3 = false;

var LED1 = false;
var LED2 = false;
var LED3 = false;

var errorLED = false;
var apiLED = false;
var waitLED = false;

var greenLED = false;
var redLED = false;

var audio = false;

// Loop sensor every sec

(function main() {

    reset();

    // Sensor below camera detects movement [2]
    if (sensor0) {
        cameraAPI();
        sensor0 = false;
    }
    setTimeout(main, 1000); // [1]
})();

(function reset() {
    sensor0 = false;

    sensor1 = false;
    sensor2 = false;
    sensor3 = false;

    LED1 = false;
    LED2 = false;
    LED3 = false;

    errorLED = false;
    apiLED = false;
    waitLED = false;

    greenLED = false;
    redLED = false;

    audio = false;
})();

// API Processing - set LED
(function cameraAPI() {
    var result = 0; // 0- Not identified; 1- Paper; 2-Metal/Plastic ; 3-Other (General Waste)

    apiLED = true;

    // Capture image with camera then create POST request [3]

    // reply [4]
    apiLED = false;

    if (result == 0) {
        // Result is failed to identify
        errorLED = true;
    } else {
        LED1 = false;
        LED2 = false;
        LED3 = false;

        // Play audio [5]
        audio = true;

        if (result == 1) {
            LED1 = true;
        }

        if (result == 2) {
            LED2 = true;
        }

        if (result == 3) {
            LED3 = true;
        }

        waitLED = true;
        waitingWaste();
        setTimeout(reset, 15000); // [5-6]
    }
})();

// Trigger Camera
(function waitingWaste() {
    // Checks if waste is put in the correct bins - [6]
    if (sensor1 == false && sensor2 == false && sensor3 == false) {
        waitLED = false;
        // Play audio - Thanks
    } else {
        if (sensor1 == LED1) {
            greenLED = true;
            redLED = false;

            sensor1 = false;
        } else if (sensor2 == LED2) {
            greenLED = true;
            redLED = false;

            sensor2 = false;
        } else if (sensor3 == LED3) {
            greenLED = true;
            redLED = false;

            sensor3 = false;
        } else {
            greenLED = false;
            redLED = true;
        }
        setTimeout(waitingWaste, 1000);
    }
})();