//----> 0. Server Setup
const express = require("express");
const app = express();
const PORTnum = 3000;
const server = require("http").createServer(app);
const publicIp = "222.99.193.84"
const localIp = "172.30.1.45"
const serverSidePort = "5500"
let api_url = `http://${publicIp}:${serverSidePort}/gps`;
const serialPort = require("serialport");
const Delimiter = require('@serialport/parser-delimiter')
const Readline = require('@serialport/parser-readline')
const axios = require('axios')

app.listen(PORTnum,() => {
	console.log(`it's alive on http://localhost:${PORTnum}`);
})

app.get("/", (req, res) => {
	return res.send("hello world");
})

app.use(express.json())


//----> 1. Serialport Setup - MCU & GPS
// ls -dev raspberry: /dev/ttyAMA0, arduino: /dev/cu.usbmodem143401 , /dev/ttyACM0
const port = new serialPort("/dev/ttyACM0", {
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: false,
});

port.on("connection",function(){
  console.log("port on!")
})


//----> 2. GPS Data Parsing
let lat = 0;
let long = 0;
let latDMS_arr = ["", "°", " ", "", "'", " ", "", `"`, ""];
let latDMS_str = "";
let longDMS_arr = ["", "°", " ", "", "'", " ", "", `"`, ""];
let longDMS_str = "";
let finalGPS = "";
let latSize = 10; //ada 11, neo m8n 10 <--- how to change soft coding?
let longSize = 12; //ada 12, neo m8n 11 <--- how to change soft coding?
let direction = "";
let latS = false;
let longW = false;
let dd = {
  lat: {
    degree: "",
    min: "",
    lat: "",
  },
  long: {
    degree: "",
    min: "",
    long: "",
  },
};

let GNGGA = {
  lat: {
    degree: "",
    min: "",
    sec: "",
  },
  long: {
    degree: "",
    min: "",
    sec: "",
  },
};

const parser = port.pipe(new Readline({ delimiter: '\n' })) //\r\n

parser.on("data", function (data) {
  // console.log("data: " +data);
  if (data.length == latSize) {
    lat = data;
    lat = Number(lat);
    if (isNaN(lat)) {
    } else {
      //DM to DD
      dd.lat.degree = parseInt(lat * 0.01);
      dd.lat.min = Number(((lat - dd.lat.degree * 100) / 60).toFixed(6));
      if (latS) {
        dd.lat.lat = Number(dd.lat.degree + dd.lat.min) * -1;
      } else {
        dd.lat.lat = Number(dd.lat.degree + dd.lat.min);
      }
      // console.log("dd.lat.degree: "+dd.lat.degree)
      // console.log("dd.lat.min: "+dd.lat.min)
      // console.log("dd.lat.lat: "+dd.lat.lat)

      //DD to DMS
      GNGGA.lat.degree = Number(dd.lat.degree);
      GNGGA.lat.min = parseInt(
        ((Math.abs(dd.lat.lat) - GNGGA.lat.degree) % 1) * 60
      );
      GNGGA.lat.sec = Math.round(
        (((Math.abs(dd.lat.lat) - GNGGA.lat.degree) % 1) * 60 - GNGGA.lat.min) *
          60
      ); //.toFixed(1) or Math.around
      // console.log("GNGGA.lat.degree: "+GNGGA.lat.degree)
      // console.log("GNGGA.lat.min: "+GNGGA.lat.min)
      // console.log("GNGGA.lat.sec: "+GNGGA.lat.sec)

      //DMS to stringfy
      latDMS_arr[0] = GNGGA.lat.degree;
      latDMS_arr[3] = GNGGA.lat.min;
      latDMS_arr[6] = GNGGA.lat.sec;

      latDMS_str = String(latDMS_arr.join(""));
      console.log("latDMS_str: " + latDMS_str);
      io.emit("dd.lat", dd.lat.lat);
      
    }
  } else if (data.length == longSize) {
    long = data;
    long = Number(long);
    if (isNaN(long)) {
    } else {
      //DM to DD
      dd.long.degree = parseInt(long * 0.01);
      dd.long.min = Number(((long - dd.long.degree * 100) / 60).toFixed(6));
      if (longW) {
        dd.long.long = Number(dd.long.degree + dd.long.min) * -1;
      } else {
        dd.long.long = Number(dd.long.degree + dd.long.min);
      }
      // console.log("dd.long.degree: "+dd.long.degree)
      // console.log("dd.long.min: "+dd.long.min)
      // console.log("dd.long.long: "+dd.long.long)

      //DD to DMS
      GNGGA.long.degree = Number(dd.long.degree);
      GNGGA.long.min = parseInt(
        ((Math.abs(dd.long.long) - GNGGA.long.degree) % 1) * 60
      );
      GNGGA.long.sec = Math.round(
        (((Math.abs(dd.long.long) - GNGGA.long.degree) % 1) * 60 -
          GNGGA.long.min) *
          60
      ); //.toFixed(1) or Math.around()
      // console.log("GNGGA.long.degree: "+GNGGA.long.degree)
      // console.log("GNGGA.long.min: "+GNGGA.long.min)
      // console.log("GNGGA.long.sec: "+GNGGA.long.sec)

      //DMS to stringfy
      longDMS_arr[0] = GNGGA.long.degree;
      longDMS_arr[3] = GNGGA.long.min;
      longDMS_arr[6] = GNGGA.long.sec;

      longDMS_str = String(longDMS_arr.join(""));
      console.log("longDMS_str: " + longDMS_str);
      io.emit("dd.long", dd.long.long);

      //FINAL GNGGA
      finalGPS = latDMS_str + " " + longDMS_str;
      console.log("finalGPS: " + finalGPS);
      io.emit("finalGPS", finalGPS);
    }
  } else if (data.length == 2) {
    direction = data;
    direction = direction.trim();

    if (direction == "N") {
      latDMS_arr[8] = direction.trim();
    } else if (direction == "S") {
      latDMS_arr[8] = direction.trim();
      latS = true;
    } else if (direction == "E") {
      longDMS_arr[8] = direction.trim();
    } else if (direction == "W") {
      longDMS_arr[8] = direction.trim();
      longW = true;
    } else {
      console.log("NSEW X");
    }
  } else {
    console.log(" : ) ");
  }
});

io.on("connection", function (client) {
  // -----> Data to send to html
  // io.emit("dd.lat", dd.lat.lat);
  // io.emit("dd.long", dd.long.long);
  // io.emit("finalGPS", finalGPS);
  // -----> 
  console.log("user connected");

  client.on("disconnect", () => {
    console.log("user disconnected");
  });
});

//----> 3. POST to Server

let gpsData = {
	lat: dd.lat.lat,
	long: dd.long.long,
	gpsdms: finalGPS
}

function posting() {
	axios
  .post(api_url, gpsData)
  .then(res => {
    console.log(`statusCode: ${res.status}`)
	//   console.log(res)
    console.log(gpsData.lat);
    console.log(gpsData.long);
    console.log(gpsData.gpsdms);
  })
  .catch(error => {
    console.error(error)
  })
}
setInterval(posting, 1000);