var five = require("johnny-five");
var firebase = require("firebase-admin");
var board;
var serviceAccount = require("./temperatureAppServiceAccountKey.json");

board = new five.Board();

// Create a new reference of Firebase db
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://temperaturerecorder-124c7.firebaseio.com/"
});

var db = firebase.database();
var ref = db.ref("restricted_access/secret_document");
ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});

board.on("ready", function() {
  var celsiusTemp, fahrenheitTemp;

  var temperature = new five.Thermometer({
    controller: "ANALOG",
    pin: "A0",
    toCelsius: function(raw) {
      var temp = Math.log(((10240000/raw)-10000));
      temp = 1 / (0.001129148 + (0.000234125 * temp) + (0.0000000876741 * temp * temp * temp));
      return temp - 273.15
    },
    freq: 1000
  });

  var lcd = new five.LCD({
    pins: [7, 8, 9, 10, 11, 12],
    backlight: 6,
    rows: 2,
    cols: 16
  });

  lcd.useChar("sbox");

  lcd.clear().print("Hola Google IO");
  lcd.cursor(1,0);
  lcd.print("Guatemala City");

  this.wait(3000, function() {
    //lcd.clear().cursor(0, 0).print("I :check::heart: 2:cdot:C :duck: :)");
    temperature.on("data", function() {
      celsiusTemp = Math.round(this.celsius*100)/100;
      fahrenheitTemp = Math.round(this.fahrenheit*100)/100;

      lcd.clear().print("TempC: " + celsiusTemp + ":sbox:C");
      lcd.cursor(1, 0);
      lcd.print("TempF: " + fahrenheitTemp + ":sbox:F");

      //firebaseRef.set({"celsiuis": this.celsius, "fahrenheit": this.fahrenheit});
      var temperatureRef = ref.child("temperatureapp");
      temperatureRef.set({
        sensor1: {
          "celsius": celsiusTemp,
          "fahrenheit": fahrenheitTemp
        }
      });

      console.log(this.celsius + "°C", this.fahrenheit + "°F");
    });
  });

});
