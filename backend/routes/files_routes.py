from flask import Blueprint, request, jsonify
from utils.helpers import load_json
import os

files_bp = Blueprint("files", __name__)

@files_bp.route("/list")
def list_user_midis():
    user_uuid = request.args.get("uuid")

    users = load_json("users.json")
    if user_uuid not in users.values():
        return jsonify({"error": "Invalid user"}), 403
    
    folder = os.path.join("data", user_uuid, "processed", "converted")
    if not os.path.isdir(folder):
        return jsonify([])

    names = sorted([
        os.path.splitext(f)[0] for f in os.listdir(folder) if f.endswith(".mid")
    ])
    return jsonify(names)

@files_bp.route("/delete/<userid>/<uid>", methods=["DELETE"])
def delete_file(userid, uid):
    users = load_json("users.json")
    if userid not in users.values():
        return jsonify({"error": "Invalid user"}), 403

    converted_path = os.path.join("data", userid, "processed", "converted")
    removed = []

    for filename in os.listdir(converted_path):
        if uid in filename and filename.endswith((".mid", ".mp3")):
            path = os.path.join(converted_path, filename)
            os.remove(path)
            removed.append(filename)

    return jsonify({"status": "deleted", "files": removed})
