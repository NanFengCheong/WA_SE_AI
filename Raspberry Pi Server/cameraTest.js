var RaspiCam = require("raspicam");
var fs = require("fs");
var path = require("path");

var camera = new RaspiCam({
    mode: "photo",
    output: "picture.jpg",
    timeout: "100"
});
camera.start();
camera.on(
    "read",
    function (err, timestamp, filename) {
        var imagePath = path.join(__dirname, filename);
        console.log(timestamp + ' ' + imagePath);
        if (fs.existsSync(imagePath)) {
            console.log(timestamp + ' ' + filename);
            // fs.unlink(imagePath, function() {});
        }
    },
    function (err) {
        console.log(err);
    }
);
