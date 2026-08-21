#include "secrets.h"
// SafeYatra — LoRa Gateway (Heltec). Person B.
// TODO: LoRa RX -> forward packet to backend (serial or WiFi POST).

void setup() {
  Serial.begin(115200);
  Serial.println("lora-gateway boot");
}

void loop() {
  // TODO: receive + forward
}
