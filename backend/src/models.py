from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

# Initialize the database object (we will link this to the app in app.py)
db = SQLAlchemy()

def generate_uuid():
    """Helper to generate string UUIDs for primary keys"""
    return str(uuid.uuid4())

class Tourist(db.Model):
    """Tracks physical bands tied to visitors."""
    __tablename__ = 'tourists'
    
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    band_id = db.Column(db.String, unique=True, nullable=False)
    band_type = db.Column(db.String, nullable=False)  # 'crowd' or 'remote'
    status = db.Column(db.String, default='active')   # 'active' or 'exited'
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)

class Zone(db.Model):
    """Represents physical locations (crowd zones or trail checkpoints)."""
    __tablename__ = 'zones'
    
    id = db.Column(db.String, primary_key=True)       # e.g., 'zone_1', 'cp_1'
    current_status = db.Column(db.String, default='safe') # 'safe', 'warning', 'danger'

class Incident(db.Model):
    """The unified log for SOS, falls, and zone breaches."""
    __tablename__ = 'incidents'
    
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    band_id = db.Column(db.String, nullable=True)     # Nullable for venue-wide crowd-risk
    type = db.Column(db.String, nullable=False)       # 'SOS', 'fall', 'zone-breach'
    location = db.Column(db.String, nullable=False)   # zone_id or lat/long string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String, default='open')     # 'open', 'acknowledged', 'resolved'

    def to_dict(self):
        """Helper to easily serialize to JSON for the frontend dashboard"""
        return {
            "id": self.id,
            "band_id": self.band_id,
            "type": self.type,
            "location": self.location,
            "timestamp": self.timestamp.isoformat(),
            "status": self.status
        }