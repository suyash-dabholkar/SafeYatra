# SafeYatra — Smart Tourist Safety Monitoring System

InnoHack · Problem Statement **DIOT-04** · SDG 10 & SDG 11

Predictive tourist safety for **two environments in one system**:
- **Crowded** (festivals, temples, stations) — patented CCI stampede prediction + a low-cost band that buzzes and points to the safe exit.
- **Remote** (treks, forests) — GPS + fall-detection band that sends SOS over LoRa with no cell signal.

Everything reports to one **authority dashboard**.

---

## Repo structure

```
safeyatra/
├── firmware/
│   ├── crowd-band/      # Person A — ESP32 band: vibrate + LED + SOS
│   ├── ble-gateway/     # Person A — ESP32 zone scanner
│   ├── remote-band/     # Person B — Heltec: GPS + fall + LoRa SOS
│   └── lora-gateway/    # Person B — Heltec LoRa receiver
├── backend/             # Person C — Flask API, DB, geofencing, anomaly, pathfinding
│   ├── ai/              # Person C — CCI/YOLO reuse from CrowdPulse
│   └── models/          # Person C — data models
├── dashboard/           # Person D — authority web app (admin + registration view)
├── trekker-app/         # Person B — trekker phone app
└── docs/                # PRD, project writeup, git rules
```

## Owners (vertical slices)

| Person | Owns |
|---|---|
| A | crowd-band + ble-gateway firmware |
| B | remote-band + lora-gateway firmware + trekker-app |
| C | backend (API/DB/geofencing/anomaly/pathfinding) + ai (CCI) |
| D | dashboard |

## Start here

1. Read **docs/GIT_RULES.md** before touching anything.
2. Copy the `.example` config files and fill in your own values (never commit the real ones):
   - `backend/.env.example` → `backend/.env`
   - each `firmware/*/secrets.example.h` → `secrets.h`
3. `git pull origin main`, branch off, build your slice. See git rules.

## Output surfaces (what a user ever touches)

- **Admin app** (dashboard) — crowd + trek modes, works on mobile + control-room screen.
- **Trek app** (trekker-app) — trekker's phone.
- **Crowd band** — physical device, no app.
