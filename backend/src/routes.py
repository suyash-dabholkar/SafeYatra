from flask import request, jsonify
from src.models import db, Tourist, Incident
from datetime import datetime
from src.logic import find_safest_exit_with_cci
# --- IN-MEMORY STATE (The Hackathon Way) ---
# We keep rapid movement data in memory so we don't crash the database!
current_position = {}  # band_id -> {"zone_id": "zone_1", "last_seen": timestamp}
zone_occupancy = {}    # zone_id -> set of band_ids
zone_status = {        # Mocked initial graph state
    "zone_1": {"status": "safe", "risk_score": 0.1},
    "zone_2": {"status": "safe", "risk_score": 0.2},
    "cp_1": {"status": "safe", "risk_score": 0.0}
}

def register_routes(app):
    
    # ==========================================
    # 1. REGISTRATION ROUTES
    # ==========================================
    @app.route('/registration/bind', methods=['POST'])
    def bind_tourist():
        data = request.json
        nfc_uid = data.get('nfc_id')
        digilocker_id = data.get('digilocker_id')
        band_type = data.get('band_type')
        
        if not nfc_uid or not band_type:
            return jsonify({"error": "Missing nfc_id or band_type"}), 400

        existing_tourist = Tourist.query.filter_by(id=nfc_uid, status='active').first()
        if existing_tourist:
            return jsonify({"error": "Band is already active. Please reset it first."}), 409
            
        new_tourist = Tourist(
            id=nfc_uid, 
            band_id=digilocker_id,
            band_type=band_type,
            status='active'
        )
        db.session.add(new_tourist)
        db.session.commit()
        print(f"[REGISTRATION] Linked NFC {nfc_uid} to {digilocker_id}")
        return jsonify({"status": "bound", "tourist_id": new_tourist.id}), 201

    @app.route('/registration/release', methods=['POST'])
    def release_tourist():
        data = request.json
        nfc_uid = data.get('nfc_id')
        
        tourist = Tourist.query.filter_by(id=nfc_uid, status='active').first()
        if not tourist:
            return jsonify({"error": "Band not found or already exited"}), 404
            
        tourist.status = 'exited'
        db.session.commit()
        return jsonify({"status": "released", "message": "Band ready for reuse"}), 200

    # ==========================================
    # 2. TELEMETRY ROUTE (The missing piece!)
    # ==========================================
    @app.route('/telemetry', methods=['POST'])
    def handle_telemetry():
        data = request.json
        band_id = data.get('band_id')
        event_type = data.get('type', 'presence')
        timestamp = datetime.now().isoformat()

        if not band_id:
            return jsonify({"error": "Missing band_id"}), 400

        # Handle Critical Alerts (SOS / Fall) -> Write straight to DB!
        if event_type in ['SOS', 'fall']:
            new_incident = Incident(
                band_id=band_id,
                type=event_type,
                location=data.get('zone_id') or data.get('lat_long', 'unknown')
            )
            db.session.add(new_incident)
            db.session.commit()
            print(f"[🚨 ALERT] {event_type.upper()} triggered by {band_id}! Saved to DB.")
            return jsonify({"status": "alert_logged", "incident_id": new_incident.id}), 201

        # Handle Routine Movement -> Keep in memory!
        new_zone = data.get('zone_id')
        if new_zone:
            old_zone = current_position.get(band_id, {}).get('zone_id')
            
            # Update position
            current_position[band_id] = {"zone_id": new_zone, "last_seen": timestamp}
            
            # Update occupancy if they moved
            if old_zone != new_zone:
                if old_zone and old_zone in zone_occupancy and band_id in zone_occupancy[old_zone]:
                    zone_occupancy[old_zone].remove(band_id)
                
                if new_zone not in zone_occupancy:
                    zone_occupancy[new_zone] = set()
                zone_occupancy[new_zone].add(band_id)
                print(f"[🚶‍♂️ MOVE] {band_id} moved to {new_zone}")

        return jsonify({"status": "success"}), 200

    # ==========================================
    # 3. DASHBOARD ROUTE (For Person 4)
    # ==========================================
    @app.route('/dashboard/live', methods=['GET'])
    def get_dashboard_data():
        # Convert memory sets to lists so JSON can read them
        occupancy_serializable = {zone: list(bands) for zone, bands in zone_occupancy.items()}
        
        # Fetch active incidents straight from our new database!
        active_incidents = Incident.query.filter_by(status='open').all()
        incidents_list = [incident.to_dict() for incident in active_incidents]
        
        return jsonify({
            "current_position": current_position,
            "zone_occupancy": occupancy_serializable,
            "zone_status": zone_status,
            "active_incidents": incidents_list
        }), 200


# Add this inside your register_routes(app) function:

    @app.route('/route/<band_id>', methods=['GET'])
    def get_live_route_for_band(band_id):
        """
        Calculates the real-time safest path for a specific tourist band 
        based on current live zone positions and CCI risk scores.
        """
        # 1. Find where the tourist currently is from our in-memory state dictionary
        tourist_state = current_position.get(band_id)
        if not tourist_state:
            return jsonify({"error": "Band not found or currently inactive in telemetry state"}), 404
            
        current_zone = tourist_state.get('zone_id')

        # 2. Mock or fetch live CCI risk scores for all zones 
        # (In a full production loop, this dictionary would be updated dynamically by your AI/CCI engine)
        live_cci_scores = {
            "zone_1": 0.1,
            "zone_2": 0.9 if zone_status.get("zone_2", {}).get("status") == "danger" else 0.2,
            "cp_1": 0.0
        }

        # 3. Run your dynamic CCI Dijkstra pathfinding engine
        path, instruction = find_safest_exit_with_cci(current_zone, live_cci_scores)

        return jsonify({
            "band_id": band_id,
            "current_zone": current_zone,
            "safest_path": path,
            "instruction": instruction
        }), 200
        
    @app.route("/cci", methods=["POST"])
    def receive_cci():
        data = request.get_json()
        zone = data["zone_id"]
        cci = data["cci"]
        # store it so the routing/Dijkstra uses this zone's CCI
        print(f"got CCI for {zone}: {cci} ({data['risk']})")
        return {"ok": True}, 200