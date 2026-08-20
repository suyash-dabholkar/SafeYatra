from flask import request, jsonify
from src.models import db, Tourist

def register_routes(app):
    @app.route('/registration/bind', methods=['POST'])
    def bind_tourist():
        """
        Receives the hardcoded NFC UID from the Arduino/ESP32 kiosk
        and links it to a tourist in the database.
        """
        data = request.json
        
        # 1. Extract the data sent by the C++ code
        nfc_uid = data.get('nfc_id')
        digilocker_id = data.get('digilocker_id') # From your kiosk UI or stubbed
        band_type = data.get('band_type')
        
        if not nfc_uid or not band_type:
            return jsonify({"error": "Missing nfc_id or band_type"}), 400

        # 2. Check if this physical band is already bound and active
        existing_tourist = Tourist.query.filter_by(id=nfc_uid, status='active').first()
        if existing_tourist:
            return jsonify({"error": "Band is already active. Please reset it first."}), 409
            
        # 3. Create the database record. 
        # Because we pass the `id` explicitly, SQLAlchemy uses our NFC UID
        # instead of generating a random one!
        new_tourist = Tourist(
            id=nfc_uid, 
            band_id=digilocker_id, # Reusing the band_id column to store the identity link
            band_type=band_type,
            status='active'
        )
        
        db.session.add(new_tourist)
        db.session.commit()
        
        print(f"[REGISTRATION] Linked NFC {nfc_uid} to {digilocker_id}")
        
        # 4. Respond to the C++ board
        return jsonify({"status": "bound", "tourist_id": new_tourist.id}), 201

    @app.route('/registration/release', methods=['POST'])
    def release_tourist():
        """
        Unlinks the tag so it can be handed to a new visitor.
        """
        data = request.json
        nfc_uid = data.get('nfc_id')
        
        tourist = Tourist.query.filter_by(id=nfc_uid, status='active').first()
        if not tourist:
            return jsonify({"error": "Band not found or already exited"}), 404
            
        tourist.status = 'exited'
        db.session.commit()
        
        return jsonify({"status": "released", "message": "Band ready for reuse"}), 200