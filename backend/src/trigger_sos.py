import requests
import sys

# Point this to your backend IP (Update if testing across devices)
API_URL = "http://127.0.0.1:5000/telemetry"

def fire_sos(band_id="04BA5F22", zone_id="zone_1"):
    payload = {
        "band_id": band_id,
        "type": "SOS",
        "zone_id": zone_id
    }
    
    try:
        print(f"🚨 Firing SOS for {band_id} in {zone_id}...")
        response = requests.post(API_URL, json=payload)
        print(f"Backend Response: HTTP {response.status_code}")
        if response.status_code == 201:
            print("✅ Incident successfully logged in database!")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    # Optional: Pass custom band/zone from terminal (e.g., python src/trigger_sos.py 04BA5F22 zone_2)
    target_band = sys.argv[1] if len(sys.argv) > 1 else "04BA5F22"
    target_zone = sys.argv[2] if len(sys.argv) > 2 else "zone_1"
    fire_sos(target_band, target_zone)