# Backend + AI (Person C)

Flask REST/MQTT. The hub — everything routes through here.

**Does:** ingest gateway telemetry · tourist/zone/incident data model · geofencing + anomaly fusion (zone-breach, no-movement, route-deviation, fall) · Dijkstra/A* exit routing (networkx) · registration bind/release · E-FIR generation · wire in CCI risk (ai/).

## Run
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # fill in, never commit .env
python app.py
```
Health check: http://localhost:5000/health

## Key endpoints (see PRD 5.2)
POST /gateway/heartbeat · POST /incident · GET /dashboard/live ·
POST /registration/bind · POST /registration/release · POST /incident/{id}/efir
