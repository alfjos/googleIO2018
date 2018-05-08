var five = require("johnny-five");

five.Board().on("ready", function() {
  var beta = 4090;
  var temperature = new five.Thermometer({
    controller: "ANALOG",
    pin: "A0",
    toCelsius: function(raw) {
      var a = 1023 - raw;
      return beta /(Math.log((1025.0 * 10 / a - 10) / 10) + beta / 298.0) - 273.0;
    },
    freq: 1000
  });

  temperature.on("data", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});
