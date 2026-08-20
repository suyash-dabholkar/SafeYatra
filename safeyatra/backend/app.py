"""SafeYatra backend — Flask entry point. Person C.
Stub with a health check so the rest of the team can build against it early.
Fill in endpoints per PRD section 5.2.
"""
from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify(status="ok", service="safeyatra-backend")


# TODO: POST /gateway/heartbeat  (BLE presence lists / LoRa event packets)
# TODO: POST /incident
# TODO: GET  /dashboard/live
# TODO: POST /registration/bind  |  /registration/release
# TODO: POST /incident/<id>/efir
# TODO: geofencing + anomaly fusion engine (models/, see PRD 5.3)
# TODO: pathfinding (networkx) for exit routing (PRD 5.4)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
