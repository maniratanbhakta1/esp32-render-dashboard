const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let latestData = {
  message: "Waiting for ESP32 data...",
  rssi: "--",
  wifiQuality: "--",
  uploadTimeMs: "--",
  estimatedUploadKbps: "--",
  counter: 0,
  lastSeen: "Not connected yet"
};

app.post("/data", (req, res) => {
  latestData = {
    ...req.body,
    lastSeen: new Date().toLocaleString()
  };

  console.log("Received from ESP32:", latestData);
  res.json({ success: true, received: latestData });
});

app.get("/api/latest", (req, res) => {
  res.json(latestData);
});

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>ESP32 WiFi Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #101820;
      color: white;
    }

    header {
      padding: 24px;
      background: #162331;
      border-bottom: 1px solid #2f4054;
    }

    h1 {
      margin: 0;
      font-size: 28px;
    }

    .status {
      margin-top: 8px;
      color: #53d769;
      font-weight: bold;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      padding: 24px;
    }

    .card {
      background: #1b2a3a;
      border: 1px solid #34495e;
      border-radius: 8px;
      padding: 20px;
    }

    .label {
      color: #9fb3c8;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .value {
      font-size: 26px;
      font-weight: bold;
      word-break: break-word;
    }

    .message {
      font-size: 22px;
      color: #4db8ff;
    }

    .bar {
      height: 14px;
      background: #31465c;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 12px;
    }

    .fill {
      height: 100%;
      width: 0%;
      background: #53d769;
      transition: width 0.3s;
    }
  </style>
</head>
<body>
  <header>
    <h1>ESP32 WiFi Dashboard</h1>
    <div class="status" id="status">Waiting for ESP32...</div>
  </header>

  <div class="grid">
    <div class="card">
      <div class="label">Message</div>
      <div class="value message" id="message">--</div>
    </div>

    <div class="card">
      <div class="label">WiFi Signal</div>
      <div class="value" id="rssi">-- dBm</div>
    </div>

    <div class="card">
      <div class="label">WiFi Quality</div>
      <div class="value" id="quality">--%</div>
      <div class="bar">
        <div class="fill" id="qualityBar"></div>
      </div>
    </div>

    <div class="card">
      <div class="label">Upload Time</div>
      <div class="value" id="uploadTime">-- ms</div>
    </div>

    <div class="card">
      <div class="label">Estimated Upload Speed</div>
      <div class="value" id="speed">-- kbps</div>
    </div>

    <div class="card">
      <div class="label">Counter</div>
      <div class="value" id="counter">--</div>
    </div>

    <div class="card">
      <div class="label">Last Seen</div>
      <div class="value" id="lastSeen">--</div>
    </div>
  </div>

  <script>
    async function loadData() {
      const response = await fetch("/api/latest");
      const data = await response.json();

      document.getElementById("message").textContent = data.message ?? "--";
      document.getElementById("rssi").textContent = (data.rssi ?? "--") + " dBm";
      document.getElementById("quality").textContent = (data.wifiQuality ?? "--") + "%";
      document.getElementById("uploadTime").textContent = (data.uploadTimeMs ?? "--") + " ms";
      document.getElementById("speed").textContent = (data.estimatedUploadKbps ?? "--") + " kbps";
      document.getElementById("counter").textContent = data.counter ?? "--";
      document.getElementById("lastSeen").textContent = data.lastSeen ?? "--";

      const quality = Number(data.wifiQuality || 0);
      document.getElementById("qualityBar").style.width = quality + "%";

      if (data.counter > 0) {
        document.getElementById("status").textContent = "ESP32 Online";
      }
    }

    loadData();
    setInterval(loadData, 2000);
  </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
