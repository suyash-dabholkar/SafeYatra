# BLE Gateway Firmware (Person A)

ESP32, one per zone. Stationary, USB-powered.

**Does:** scan BLE ads → keep `{uuid, rssi, last_seen}` → POST to backend every 1–2s (which UUIDs are in this zone) · receive zone-status from backend and relay `{zone_status, exit_direction}` to bands · fast-path SOS uplink.
