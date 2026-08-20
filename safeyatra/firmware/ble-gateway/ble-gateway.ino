#include "secrets.h"
// SafeYatra — BLE Gateway (ESP32). Person A.
// TODO: scan BLE, POST presence list to BACKEND_URL, relay zone-status to bands.

void setup() {
  Serial.begin(115200);
  Serial.println("ble-gateway boot");
}

void loop() {
  // TODO: scan + forward + relay
}
