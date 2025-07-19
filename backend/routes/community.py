from flask import Blueprint, request, jsonify
from utils.helpers import load_json, save_json, json
import os
from datetime import datetime, timezone
import random
# Get the first day of the current month at 00:00 UTC
now = datetime.now(timezone.utc)
start_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc).timestamp()


community_bp = Blueprint("community", __name__)

LIKES_DIR = "community/likes"
USERS_FILE = "users.json"

os.makedirs(LIKES_DIR, exist_ok=True)

def is_valid_user(uuid):
    users = load_json(USERS_FILE)
    return uuid in users.values()

def get_month_filename():
    now = datetime.now(timezone.utc)
    return f"{now.year}-{now.month:02d}.json"

def get_votes(path, file_id):
    if not os.path.exists(path):
        return []
    data = load_json(path)
    return data.get(file_id, [])

def update_vote(path, file_id, user_uuid, add=True):
    if not os.path.exists(path):
        data = {}
    else:
        data = load_json(path)

    if file_id not in data:
        data[file_id] = []

    if add and user_uuid not in data[file_id]:
        data[file_id].append(user_uuid)
    elif not add and user_uuid in data[file_id]:
        data[file_id].remove(user_uuid)

    save_json(path, data)
    return data[file_id]

@community_bp.route("/community/toggle-like/<file_id>", methods=["POST"])
def toggle_like(file_id):
    user_uuid = request.json.get("uuid")
    if not is_valid_user(user_uuid):
        return jsonify({"error": "Invalid user"}), 403

    like_path = os.path.join(LIKES_DIR, get_month_filename())

    if not os.path.exists(like_path):
        data = {}
    else:
        data = load_json(like_path)

    if file_id not in data:
        data[file_id] = []

    if user_uuid in data[file_id]:
        data[file_id].remove(user_uuid)
        action = "unliked"
    else:
        data[file_id].append(user_uuid)
        action = "liked"

    save_json(like_path, data)
    return jsonify({
        "status": action,
        "file_id": file_id,
        "total": len(data[file_id])
    })


@community_bp.route("/community/random", methods=["POST"])
def get_random_unliked_recording():
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
    like_path = os.path.join("community", "likes", get_month_filename())
    likes_data = load_json(like_path) if os.path.exists(like_path) else {}

    candidates = []

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

                    if userid in like_list:
                        continue  # skip liked

                    candidates.append({
                        "id": file_id,
                        "user": username,
                        "label": rec_data.get("label", file_id),
                        "data": rec_data.get("data"),
                        "timestamp": file_timestamp,
                        "likes": len(like_list),
                        "liked": False  # by definition
                    })

                except Exception:
                    continue

    if not candidates:
        return jsonify({"error": "No new recordings..."}), 404

    return jsonify(random.choice(candidates))
