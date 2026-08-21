import requests
import time
import random
from datetime import datetime

# --- CONFIG: fill these in from what Person 3 gives you ---
ESP_IP = "192.168.1.XX"          # <-- ask Person 3 for the ESP's actual IP (from Serial Monitor)
ESP_URL = f"http://{ESP_IP}/command"

BACKEND_API_URL = "http://127.0.0.1:5000/telemetry"

ZONES = ["zone_1", "zone_2", "cp_1"]
BANDS = ["04BA5F22", "band_B", "band_C"]

DIRECTIONS = ["FLASH_LEFT_LED", "FLASH_RIGHT_LED", "FLASH_STRAIGHT_LED"]


def send_command_to_esp(command, duration_ms=None):
    """Sends a single command to the physical ESP over HTTP."""
    payload = {"command": command}
    if duration_ms:
        payload["duration_ms"] = duration_ms

    try:
        response = requests.post(ESP_URL, json=payload, timeout=2)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ESP <- {payload} -> HTTP {response.status_code}")
    except Exception as e:
        print(f"Failed to reach ESP at {ESP_URL}: {e}")


def send_telemetry(band_id, zone_id, event_type="presence"):
    """Sends telemetry to your own backend (unrelated to the ESP command path)."""
    payload = {"band_id": band_id, "type": event_type, "zone_id": zone_id}
    if event_type == "fall":
        payload["lat_long"] = "32.83, 74.87"

    try:
        response = requests.post(BACKEND_API_URL, json=payload)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Backend <- {event_type.upper()} for {band_id} -> HTTP {response.status_code}")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")


def run_danger_alert_sequence(num_direction_flashes=None):
    """
    Simulates a zone flipping to DANGER:
    1. Long buzzer first (grabs attention)
    2. Followed by a short random sequence of L/R/Straight LED flashes
       (simulating the pathfinding engine guiding someone step by step)
    """
    if num_direction_flashes is None:
        num_direction_flashes = random.randint(7, 10)

    print("\n🚨 DANGER ALERT SEQUENCE STARTING 🚨")

    # 1. Long buzzer first
    send_command_to_esp("BUZZER", duration_ms=1500)
    time.sleep(1.7)  # wait slightly longer than the buzzer duration before LEDs start

    # 2. Random direction sequence
    for i in range(num_direction_flashes):
        direction = random.choice(DIRECTIONS)
        send_command_to_esp(direction)
        print(f"  Step {i + 1}/{num_direction_flashes}: {direction}")
        time.sleep(0.8)  # gap between each direction flash

    print("✅ Alert sequence complete.\n")


print("🚀 Starting Fake Hardware Sender...")
print(f"Sending ESP commands to: {ESP_URL}")
print("Press Ctrl+C to stop.")

try:
    while True:
        # 1. Simulate normal walking around (still hits your Flask backend, not the ESP)
        band = random.choice(BANDS)
        zone = random.choice(ZONES)
        send_telemetry(band, zone, "presence")

        # 2. Randomly trigger a crisis
        crisis_roll = random.randint(1, 100)
        if crisis_roll <= 3:
            print("\n🚨 SIMULATING SOS BUTTON PRESS 🚨")
            send_telemetry(random.choice(BANDS), zone, "SOS")
        elif crisis_roll <= 5:
            print("\n🚨 SIMULATING FALL DETECTION 🚨")
            send_telemetry(random.choice(BANDS), zone, "fall")
        elif crisis_roll <= 8:
            # Simulates a zone flipping to danger -> full ESP alert sequence
            run_danger_alert_sequence()

        time.sleep(3)
except KeyboardInterrupt:
    print("\nShutting down fake sender.")