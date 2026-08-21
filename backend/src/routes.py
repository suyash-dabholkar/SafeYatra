from flask import request, jsonify
from datetime import datetime
from src.models import db, Tourist, Incident
from src.logic import find_safest_exit_with_cci, classify_zone_status


current_position = {}  # band_id -> {"zone_id": "zone_1", "last_seen": timestamp}
zone_occupancy = {} 
# zone_id -> set of band_ids
gateway_commands = {
    "SafeYatra_Gateway_1": "STOP_ALERT",
    "SafeYatra_Gateway_2": "STOP_ALERT",
    "SafeYatra_Gateway_3": "STOP_ALERT"
}
zone_cci_scores = {
    "zone_1": 0.0,
    "zone_2": 0.0,
    "zone_3": 0.0,
}

zone_status = {
    "zone_1": {"status": "safe", "risk_score": 0.0},
    "zone_2": {"status": "safe", "risk_score": 0.0},
    "zone_3": {"status": "safe", "risk_score": 0.0}
}


def register_routes(app):
    # ==========================================
# GATEWAY COMMAND ROUTE
# ==========================================

    @app.route('/gateway/command/<gateway_id>', methods=['GET'])
    def get_gateway_command(gateway_id):

        command = gateway_commands.get(
            gateway_id,
            "STOP_ALERT"
        )

        print(
            f"[GATEWAY] {gateway_id} -> {command}"
        )

        # Clear command after delivering it
        gateway_commands[gateway_id] = "STOP_ALERT"

        return jsonify({
            "gateway_id": gateway_id,
            "command": command
        }), 200

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

        # NOTE: Tourist.id (the NFC UID) is the identifier used EVERYWHERE ELSE
        # in the system (telemetry, current_position, zone_occupancy, incidents).
        # digilocker_id is stored separately and is NEVER used as the tracking key.
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

        # Clean up in-memory state so an exited band doesn't linger on the live map
        old_zone = current_position.get(nfc_uid, {}).get('zone_id')
        if old_zone and old_zone in zone_occupancy:
            zone_occupancy[old_zone].discard(nfc_uid)
        current_position.pop(nfc_uid, None)

        return jsonify({"status": "released", "message": "Band ready for reuse"}), 200

    # ==========================================
    # 2. TELEMETRY ROUTE
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
            print(f"[ALERT] {event_type.upper()} triggered by {band_id}! Saved to DB.")
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
                print(f"[MOVE] {band_id} moved to {new_zone}")

                # --- ZONE-BREACH CHECK ---
                # Minimal version: if the zone they just entered is currently
                # classified 'danger', log it as an incident immediately.
                if zone_status.get(new_zone, {}).get("status") == "danger":
                    breach_incident = Incident(
                        band_id=band_id,
                        type='zone-breach',
                        location=new_zone
                    )
                    db.session.add(breach_incident)
                    db.session.commit()
                    print(f"[BREACH] {band_id} entered DANGER zone {new_zone}!")

        return jsonify({"status": "success"}), 200

    # ==========================================
    # 3. CCI INGEST ROUTE
    # ==========================================
    @app.route("/cci", methods=["POST"])
    def receive_cci():

        print("\n========== CCI REQUEST RECEIVED ==========")

        data = request.get_json(silent=True)

        print("Raw data:", data)

        if data is None:
            print("ERROR: No JSON received.")
            return jsonify({"error": "Invalid or missing JSON"}), 400

        zone = data.get("zone_id")
        cci = data.get("cci")
        risk = data.get("risk")

        print("Zone:", zone)
        print("CCI:", cci)
        print("Risk:", risk)

        if zone is None or cci is None:
            print("ERROR: Missing zone_id or cci")
            return jsonify({
                "error": "Missing zone_id or cci"
            }), 400

        try:
            cci = float(cci)
        except (TypeError, ValueError):

            print("ERROR: CCI is not a number.")

            return jsonify({
                "error": "CCI must be a number"
            }), 400

        # -------------------------------------------------
        # Store latest CCI
        # -------------------------------------------------

        zone_cci_scores[zone] = cci 
        # ==========================================
# SEND RISK COMMAND TO GATEWAY
# ==========================================

        if zone == "zone_1":

            if cci > 75:

                gateway_commands[
                    "SafeYatra_Gateway_1"
                ] = "HIGH_RISK"

                print(
                    "[GATEWAY 1] HIGH_RISK command queued"
                )

            elif cci >= 55:

                gateway_commands[
                    "SafeYatra_Gateway_1"
                ] = "WARNING"

                print(
                    "[GATEWAY 1] WARNING command queued"
                )

            else:

                gateway_commands[
                    "SafeYatra_Gateway_1"
                ] = "STOP_ALERT"

                print(
                    "[GATEWAY 1] STOP_ALERT command queued"
                )

        # -------------------------------------------------
        # Classify using backend logic
        # -------------------------------------------------

        new_status = classify_zone_status(cci)

        old_status = zone_status.get(
            zone,
            {}
        ).get(
            "status",
            "safe"
        )

        zone_status[zone] = {
            "status": new_status,
            "risk_score": cci
        }

        print(
            f"[CCI] {zone}: "
            f"CCI={cci:.2f} "
            f"AI_RISK={risk} "
            f"BACKEND_STATUS={new_status}"
        )

        # -------------------------------------------------
        # Danger transition
        # -------------------------------------------------

        if (
            old_status != "danger"
            and new_status == "danger"
        ):

            print(
                f"[ZONE DANGER] "
                f"{zone} crossed into danger."
            )

            affected_bands = list(
                zone_occupancy.get(zone, [])
            )

            for band_id in affected_bands:

                path, instruction = \
                    find_safest_exit_with_cci(
                        zone,
                        zone_cci_scores
                    )

                print(
                    f"[REROUTE] "
                    f"{band_id} -> "
                    f"{instruction}"
                )

            crowd_incident = Incident(
                band_id=None,
                type="crowd-risk",
                location=zone
            )

            db.session.add(crowd_incident)
            db.session.commit()

        print("==========================================\n")

        return jsonify({
            "status": "recorded",
            "zone": zone,
            "cci": cci,
            "ai_risk": risk,
            "classified": new_status
        }), 200

    # ==========================================
    # 4. DASHBOARD ROUTE (For Person 4)
    # ==========================================
    @app.route('/dashboard/live', methods=['GET'])
    def get_dashboard_data():
        occupancy_serializable = {zone: list(bands) for zone, bands in zone_occupancy.items()}

        active_incidents = Incident.query.filter_by(status='open').all()
        incidents_list = [incident.to_dict() for incident in active_incidents]

        return jsonify({
            "current_position": current_position,
            "zone_occupancy": occupancy_serializable,
            "zone_status": zone_status,
            "active_incidents": incidents_list
        }), 200

    # ==========================================
    # 5. LIVE ROUTE FOR A SPECIFIC BAND
    # ==========================================
    @app.route('/route/<band_id>', methods=['GET'])
    def get_live_route_for_band(band_id):
        """
        Calculates the real-time safest path for a specific tourist band
        based on current live zone positions and CCI risk scores.
        """
        tourist_state = current_position.get(band_id)
        if not tourist_state:
            return jsonify({"error": "Band not found or currently inactive in telemetry state"}), 404

        current_zone = tourist_state.get('zone_id')

        # Uses REAL live scores now, updated by /cci — no more hardcoded values
        path, instruction = find_safest_exit_with_cci(current_zone, zone_cci_scores)

        return jsonify({
            "band_id": band_id,
            "current_zone": current_zone,
            "safest_path": path,
            "instruction": instruction
        }), 200