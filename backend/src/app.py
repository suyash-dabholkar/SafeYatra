from flask import Flask
from src.models import db
from src.routes import register_routes

app = Flask(__name__)

# --- Configuration ---
# This creates a local file named 'safeyatra.db' inside an 'instance' folder
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///safeyatra.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Initialization ---
db.init_app(app)

# Hook up the endpoints from routes.py
register_routes(app)

# --- Database Setup ---
# This automatically creates the database tables before the first request
with app.app_context():
    db.create_all()
    print("✅ Database tables checked/created.")

if __name__ == '__main__':
    print("🚀 Starting SafeYatra Backend...")
    app.run(host='0.0.0.0', port=5000, debug=True)