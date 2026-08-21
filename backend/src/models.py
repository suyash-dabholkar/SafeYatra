from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

# Initialize the database object (we will link this to the app in app.py)
db = SQLAlchemy()

def generate_uuid():
    """Helper to generate string UUIDs for primary keys"""
    return str(uuid.uuid4())

class Tourist(db.Model):
    # FIX 2: Use explicit names. 
    # nfc_uid is the primary key and used by telemetry/routing.
    nfc_uid = db.Column(db.String(50), primary_key=True) 
    
    # digilocker_ref is ONLY used at the registration desk for identity.
    digilocker_ref = db.Column(db.String(100), unique=True, nullable=False)
    
    name = db.Column(db.String(100))
    emergency_contact = db.Column(db.String(20))

class Zone(db.Model):
    """Represents physical locations (crowd zones or trail checkpoints)."""
    __tablename__ = 'zones'
    
    id = db.Column(db.String, primary_key=True)       # e.g., 'zone_1', 'cp_1'
    current_status = db.Column(db.String, default='safe') # 'safe', 'warning', 'danger'

class Incident(db.Model):
    __tablename__ = 'incidents'
    
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    band_id = db.Column(db.String, nullable=True)     
    type = db.Column(db.String, nullable=False)       
    location = db.Column(db.String, nullable=False)   
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String, default='open')     

    # ADD THIS METHOD:
    def to_dict(self):
        return {
            "id": self.id,
            "band_id": self.band_id,
            "type": self.type,
            "location": self.location,
            "timestamp": self.timestamp.isoformat(),
            "status": self.status
        }