# rpi4_clientside

default code of rpi4 client side
server.js
```javascript
const express = require("express");
const app = express();
const PORT = 3000;
// const request = require("request");
const axios = require('axios')
const https = require('https')
const publicIp = "111.22.33.44" //put your Public IP
const localIp = "172.30.1.1" // or put your Private IP 
const serverSidePort = "5500" // Port number portfowarded
let api_url = `http://${publicIp}:${serverSidePort}/gps`;
app.use(express.json())

app.listen(PORT,() => {
	console.log(`it's alive on http://localhost:${PORT}`);
})

let lat = "hi";
let long = "long";
let gpsdms = "GPS";

let gpsData = {
	lat: lat,
	long: long,
	gpsdms: gpsdms
}

app.get("/", (req, res) => {
	return res.send("hello world");
})

function posting() {
	axios
  .post(api_url, gpsData)
  .then(res => {
    console.log(`statusCode: ${res.status}`)
	  console.log(res)
	  console.log(lat);
  })
  .catch(error => {
    console.error(error)
  })
}

setInterval(posting, 1000);
```

ES6 Version.
package.json
```javascript
import express from "express";
const app = express();
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";


const PORTnum = 3000;
const publicIp = "222.99.193.84";
const localIp = "172.30.1.45";
const serverSidePort = "5500";
let api_url = `http://${publicIp}:${serverSidePort}/gps`;

app.listen(PORTnum, () => {
  console.log(`it's alive on http://localhost:${PORTnum}`);
});

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });

app.use(express.json());

const port = new SerialPort({
  path: "/dev/cu.usbmodem144301",
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: false,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" })); //\r\n
parser.on("data", function (data) {
    console.log("data: " + data);
});

console.log(SerialPort);
```