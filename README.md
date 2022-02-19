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
let api_url = "http://172.30.1.45:5500/gps";
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
