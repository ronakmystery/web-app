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

    # Return filenames with timestamps
    files = []
    for filename in os.listdir(folder):
        if filename.endswith(".mid"):
            filepath = os.path.join(folder, filename)
            stat = os.stat(filepath)
            files.append({
                "id": os.path.splitext(filename)[0],
                "timestamp": int(stat.st_mtime)  # Use mtime (last modified) as a proxy for created time
            })

    files.sort(key=lambda x: x["timestamp"], reverse=True)
    return jsonify(files)


@files_bp.route("/delete/<userid>/<uid>", methods=["DELETE"])
def delete_file(userid, uid):
    users = load_json("users.json")
    if userid not in users.values():
        return jsonify({"error": "Invalid user"}), 403

    converted_path = os.path.join("data", userid, "processed", "converted")
    removed = []

    for ext in [".mid", ".mp3"]:
        filename = f"{uid}{ext}"
        path = os.path.join(converted_path, filename)
        if os.path.exists(path):
            os.remove(path)
            removed.append(filename)

    return jsonify({"status": "deleted", "files": removed})
