# backend/ai — CCI Engine (Person 2)

Reuses the CrowdPulse pipeline and emits a per-zone risk score.

## Files
- `cci_calculation.py` — your CCI formula (copied from CrowdPulse, unchanged)
- `cci_engine.py` — `CCIEngine`: frame -> {people, density, movement, cci, risk}
- `run_cci.py` — runs the engine on a camera/video, posts to backend `POST /cci`
- `risk_model.pkl` — **copy your trained model here** (not in git; it's gitignored)

## Setup
```bash
cp /path/to/CrowdPulse/models/risk_model.pkl backend/ai/risk_model.pkl
pip install ultralytics opencv-python scikit-learn pandas joblib requests
```

## Run
```bash
cd backend/ai
python run_cci.py --source 0 --zone zone-A --show      # webcam
python run_cci.py --source crowd.mp4 --zone gate-2     # recorded footage (safer for demo)
```

## Backend contract (hand this to Person 1)
`POST /cci`  body: `{zone_id, people, density, movement, cci, risk, timestamp}`
Backend maps risk -> zone_status and pushes to the gateway, which relays to the bands.
