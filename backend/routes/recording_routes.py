from flask import Blueprint, request, jsonify
from utils.helpers import load_json, save_json
import os, uuid, json
from routes.community import get_month_filename

from datetime import datetime, timezone

# Get the first day of the current month at 00:00 UTC
now = datetime.now(timezone.utc)
start_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc).timestamp()


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

    # Load current month's like data
    like_path = os.path.join("community", "likes", get_month_filename())
    likes_data = load_json(like_path) if os.path.exists(like_path) else {}

    recordings = []
    for filename in os.listdir(user_dir):
        if filename.endswith(".json"):
            path = os.path.join(user_dir, filename)
            try:
                with open(path) as f:
                    data = json.load(f)

                file_id = data.get("id", os.path.splitext(filename)[0])
                like_list = likes_data.get(file_id, [])

                data["id"] = file_id
                data["likes"] = len(like_list)
                data["liked"] = userid in like_list

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

@recordings_bp.route("/recordings/top", methods=["POST"])
def list_top_recordings():
    users = load_json("users.json")
    data = request.get_json()
    userid = data.get("userid")

    with open("emails.txt") as f:
        pro_usernames = {line.strip() for line in f if line.strip()}

    pro_uuids = {users[u] for u in pro_usernames if u in users}
    uuid_to_username = {v: k for k, v in users.items()}

    if userid not in pro_uuids:
        return jsonify({"error": "Access restricted to pro users only"}), 403

    base_dir = "recordings"
    all_recordings = []

    like_path = os.path.join("community", "likes", get_month_filename())
    likes_data = load_json(like_path) if os.path.exists(like_path) else {}

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
                        rec_data = json.load(f)

                    file_timestamp = os.path.getmtime(path)
                    if file_timestamp < start_of_month:
                        continue

                    file_id = rec_data.get("id", os.path.splitext(filename)[0])
                    like_list = likes_data.get(file_id, [])

                    all_recordings.append({
                        "id": file_id,
                        "user": username,
                        "label": rec_data.get("label", file_id),
                        "data": rec_data.get("data"),
                        "timestamp": file_timestamp,
                        "likes": len(like_list),
                        "liked": userid in like_list
                    })

                except Exception:
                    continue

    all_recordings.sort(key=lambda x: x["likes"], reverse=True)
    return jsonify(all_recordings[:10])
