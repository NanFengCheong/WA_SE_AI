var gpio = require("onoff").Gpio;
const config = require('./config.json')
//constant
var gpioComponent = {
    paperLed: new gpio(config.paperLedGpio, "out"),
    plasticLed: new gpio(config.plasticLedGpio, "out"),
    otherLed: new gpio(config.otherLedGpio, "out"),
    button1Led: new gpio(config.button1LedGpio, "high"),
    button2Led: new gpio(config.button2LedGpio, "high"),
    button3Led: new gpio(config.button3LedGpio, "high"),
    button4Led: new gpio(config.button4LedGpio, "high"),
    sensor1: new gpio(config.paperSensorGpio, "in", "rising", {
        debounceTimeout: 500
    }),
    sensor2: new gpio(config.plasticSensorGpio, "in", "rising", {
        debounceTimeout: 500
    }),
    sensor3: new gpio(config.otherSensorGpio, "in", "rising", {
        debounceTimeout: 500
    }),
    button1: new gpio(config.button1Gpio, "in", "rising", {
        debounceTimeout: 10
    }),
    button2: new gpio(config.button2Gpio, "in", "rising", {
        debounceTimeout: 10
    }),
    button3: new gpio(config.button3Gpio, "in", "rising", {
        debounceTimeout: 10
    }),
    button4: new gpio(config.button4Gpio, "in", "rising", {
        debounceTimeout: 10
    })
};

module.exports = gpioComponent