
from flask import Flask
from routes.admin_routes import admin_bp
from routes.auth_routes import auth_bp
from routes.midi_routes import midi_bp
from routes.files_routes import files_bp
from routes.recording_routes import recordings_bp    

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024

# Register Blueprints
app.register_blueprint(admin_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(midi_bp)
app.register_blueprint(files_bp)
app.register_blueprint(recordings_bp)

@app.route('/')
def test():
    return {"status": "server running"}
