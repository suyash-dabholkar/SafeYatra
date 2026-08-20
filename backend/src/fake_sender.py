import requests
import time
import random


API_URL = "http://127.0.0.1:5000/telemetry"

ZONES = ["zone_1", "zone_2", "cp_1"]
BANDS = ["band_A", "band_B", "band_C"]

def send_telemetry(band_id, zone_id, event_type="presence"):
    payload = {
        "band_id": band_id,
        "type": event_type,
        "zone_id": zone_id
    }
    
    if event_type == "fall":
        payload["lat_long"] = "32.83, 74.87" # Fake GPS for remote band demo

    try:
        response = requests.post(API_URL, json=payload)
        print(f"Sent {event_type} for {band_id} -> HTTP {response.status_code}")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")

print("Starting Fake Hardware Sender...")
print("Press Ctrl+C to stop.")

try:
    while True:
        # 1. Simulate normal walking around
        band = random.choice(BANDS)
        zone = random.choice(ZONES)
        send_telemetry(band, zone, "presence")
        
        # 2. Randomly trigger a crisis (5% chance per tick)
        crisis_roll = random.randint(1, 100)
        if crisis_roll <= 3:
            print("\n🚨 SIMULATING SOS BUTTON PRESS 🚨")
            send_telemetry(random.choice(BANDS), zone, "SOS")
        elif crisis_roll <= 5:
            print("\n🚨 SIMULATING FALL DETECTION 🚨")
            send_telemetry(random.choice(BANDS), zone, "fall")
            
        time.sleep(3) # Wait 3 seconds before next tick
except KeyboardInterrupt:
    print("\nShutting down fake sender.")