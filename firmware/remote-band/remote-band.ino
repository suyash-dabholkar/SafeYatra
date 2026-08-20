#include "secrets.h"
// SafeYatra — Remote Band (Heltec ESP32-LoRa). Person B.
// TODO: read GPS (NMEA), MPU6050 fall heuristic, LoRa TX on fall/SOS.

void setup() {
  Serial.begin(115200);
  Serial.println("remote-band boot");
}

void loop() {
  // TODO: poll GPS, run fall check, transmit events over LoRa
}
