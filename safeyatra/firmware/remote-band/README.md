# Remote Band Firmware (Person B)

Heltec WiFi-LoRa-32 + NEO-6M GPS + MPU6050.

**Does:** GPS fix every 30–60s · two-stage fall detection (free-fall dip → impact spike → stillness) · on fall/SOS, send `{band_id, lat, long, event_type, ts}` over LoRa · buzzer feedback + send-ACK.
