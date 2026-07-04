#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

const char* ssid = "motorola edge 60 fusion";
const char* password = "12345678";

const char* serverUrl = "https://esp32-render-dashboard.onrender.com/data";

int counter = 0;

int getWifiQuality(int rssi) {
  if (rssi <= -100) return 0;
  if (rssi >= -50) return 100;
  return 2 * (rssi + 100);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // Demo only. Later use proper SSL certificate.

    HTTPClient http;

    int rssi = WiFi.RSSI();
    int wifiQuality = getWifiQuality(rssi);
    counter++;

    String payload = "{";
    payload += "\"message\":\"message from esp 32\",";
    payload += "\"rssi\":" + String(rssi) + ",";
    payload += "\"wifiQuality\":" + String(wifiQuality) + ",";
    payload += "\"counter\":" + String(counter);

    payload += "}";

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    unsigned long startTime = millis();
    int httpResponseCode = http.POST(payload);
    unsigned long uploadTimeMs = millis() - startTime;

    float estimatedUploadKbps = 0;
    if (uploadTimeMs > 0) {
      estimatedUploadKbps = (payload.length() * 8.0) / uploadTimeMs;
    }

    http.end();

    String finalPayload = "{";
    finalPayload += "\"message\":\"message from esp 32\",";
    finalPayload += "\"rssi\":" + String(rssi) + ",";
    finalPayload += "\"wifiQuality\":" + String(wifiQuality) + ",";
    finalPayload += "\"uploadTimeMs\":" + String(uploadTimeMs) + ",";
    finalPayload += "\"estimatedUploadKbps\":" + String(estimatedUploadKbps, 2) + ",";
    finalPayload += "\"counter\":" + String(counter);
    finalPayload += "}";

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    int finalResponseCode = http.POST(finalPayload);

    Serial.print("HTTP Response: ");
    Serial.println(finalResponseCode);
    Serial.println(finalPayload);

    http.end();
  } else {
    Serial.println("WiFi disconnected");
  }

  delay(5000);
}
