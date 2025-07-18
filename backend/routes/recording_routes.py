from flask import Blueprint, request, jsonify
from utils.helpers import load_json, save_json
import os, uuid, json,datetime

recordings_bp = Blueprint("recordings", __name__)

@recordings_bp.route("/upload_recording", methods=["POST"])
def process_recording_upload():
    print(request.form)
    userid = request.form.get("userid")
    users = load_json("users.json")

    if userid not in users.values():
        return jsonify({"error": "Invalid user"}), 403

    recording_json = request.form.get("recording")


    uid = str(uuid.uuid4())
    user_dir = os.path.join("recordings", userid)
    os.makedirs(user_dir, exist_ok=True)

    filename = f"{uid}.json"
    save_path = os.path.join(user_dir, filename)

    recording_data = json.loads(recording_json)
    label = request.form.get("label") or "Untitled"
    recording_datetime = request.form.get("datetime") 

    save_json(save_path, {
        "id": uid,
        "user": userid,
        "label": label, 
        "data": recording_data,
        "datetime": recording_datetime
    })


    return jsonify({
        "status": "ok",
    })


@recordings_bp.route("/recordings/<userid>", methods=["GET"])
def list_user_recordings(userid):
    users = load_json("users.json")
    if userid not in users.values():
        return jsonify({"error": "Invalid user"}), 403

    user_dir = os.path.join("recordings", userid)
    if not os.path.exists(user_dir):
        return jsonify([])

    recordings = []
    for filename in os.listdir(user_dir):
        if filename.endswith(".json"):
            with open(os.path.join(user_dir, filename)) as f:
                try:
                    data = json.load(f)
                    recordings.append(data)
                except Exception:
                    continue

    return jsonify(recordings)

@recordings_bp.route("/recordings/<userid>/<recording_id>", methods=["DELETE"])
def delete_user_recording(userid, recording_id):
    users = load_json("users.json")
    if userid not in users.values():
        return jsonify({"error": "Invalid user"}), 403

    user_dir = os.path.join("recordings", userid)
    path = os.path.join(user_dir, f"{recording_id}.json")

    if not os.path.exists(path):
        return jsonify({"error": "Recording not found"}), 404

    os.remove(path)
    return jsonify({"status": "deleted", "id": recording_id})


@recordings_bp.route("/recordings/latest", methods=["POST"])
def list_latest_recordings():
    users = load_json("users.json")
    data = request.get_json()
    userid = data.get("userid")




    with open("emails.txt") as f:
        pro_usernames = {line.strip() for line in f if line.strip()}

    pro_uuids = {users[u] for u in pro_usernames if u in users}
    uuid_to_username = {v: k for k, v in users.items()}

    if userid not in users.values() or userid not in pro_uuids:
        return jsonify({"error": "Access restricted to pro users only"}), 403

    base_dir = "recordings"
    all_recordings = []

    print("Received userid:", userid)
    print("All UUIDs:", list(users.values()))
    print("Pro UUIDs:", list(pro_uuids))

    for user_uuid in os.listdir(base_dir):
        if user_uuid not in pro_uuids:
            continue

        user_dir = os.path.join(base_dir, user_uuid)
        if not os.path.isdir(user_dir):
            continue

        username = uuid_to_username.get(user_uuid, "unknown")

        for filename in os.listdir(user_dir):
            if filename.endswith(".json"):
                path = os.path.join(user_dir, filename)
                try:
                    with open(path) as f:
                        data = json.load(f)
                        all_recordings.append({
                            "id": data.get("id", os.path.splitext(filename)[0]),
                            "user": username,
                            "label": data.get("label", data.get("id")),
                            "data": data.get("data"),
                            "timestamp": os.path.getmtime(path)
                        })
                except Exception:
                    continue

    all_recordings.sort(key=lambda x: x["timestamp"], reverse=True)
    return jsonify(all_recordings[:100])
