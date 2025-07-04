from flask import Blueprint, request, jsonify, send_file, Response
from utils.helpers import load_json
from utils.processing import process_midi_upload
import os

midi_bp = Blueprint("midi", __name__)

@midi_bp.route("/upload", methods=["POST"])
def upload():
    return process_midi_upload(request)

@midi_bp.route("/converted/<userid>/<filename>")
def serve_file(userid, filename):
    path = os.path.join("data", userid, "processed", "converted", filename)
    if not os.path.exists(path):
        return "File not found", 404
    return send_file(path)

@midi_bp.route("/status_stream/<userid>/<uid>")
def stream(userid, uid):
    status_file = os.path.join("data", userid, "working", f"{uid}.status")

    def event_stream():
        import time
        while True:
            if os.path.exists(status_file):
                with open(status_file) as f:
                    status = f.read().strip()
                yield f"data: {status}\n\n"
                if status == "done":
                    break
            time.sleep(1)

    return Response(event_stream(), content_type="text/event-stream")
