#include "secrets.h"
// SafeYatra — Crowd Band (ESP32). Person A.
// TODO: BLE advertise BAND_UUID; listen for {zone_status, exit_direction};
//       drive vibration motor + direction LED; SOS button -> gateway.

void setup() {
  Serial.begin(115200);
  // TODO: init BLE, GPIO (motor via transistor, LEDs, SOS button w/ pulldown)
  Serial.println("crowd-band boot");
}

void loop() {
  // TODO: broadcast presence, handle zone-status writes, handle SOS press
}
