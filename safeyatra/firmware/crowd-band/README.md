# Crowd Band Firmware (Person A)

ESP32 band. Dumb by design — the brain is in the backend.

**Does:** broadcast its UUID over BLE (~1Hz) · receive `{zone_status, exit_direction}` from the nearest gateway · vibrate (single buzz = warning, continuous = danger) · light the LED for the exit direction · send SOS on button press.

**Build:** Arduino IDE / PlatformIO, ESP32 board. Copy `secrets.example.h` → `secrets.h` and fill WiFi (gateway pairing) before flashing.
