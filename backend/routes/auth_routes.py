from flask import Blueprint, request, jsonify
from utils.helpers import load_json, save_json, load_email_list, add_email_to_txt, hash_password
import bcrypt, uuid

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/verify", methods=["POST"])
def verify():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    code = data.get("code")
    pro_code = load_json("code.json").get("code")

    if code != pro_code:
        return jsonify({"error": "Wrong code"}), 403

    users = load_json("users.json")
    passwords = load_json("passwords.json")
    pro_emails = load_email_list()

    if email not in users:
        users[email] = str(uuid.uuid4())
        passwords[email] = hash_password(password)
        save_json("users.json", users)
        save_json("passwords.json", passwords)
        add_email_to_txt(email)
        return jsonify({"uuid": users[email], "status": "pro_verified"})

    if email not in pro_emails:
        return jsonify({"error": "Not a patreon"}), 403

    hashed = passwords.get(email)
    if not hashed or not bcrypt.checkpw(password.encode(), hashed.encode()):
        return jsonify({"error": "Wrong password"}), 403

    return jsonify({"uuid": users[email], "status": "pro_verified"})

@auth_bp.route("/verify_uuid", methods=["POST"])
def verify_uuid():
    data = request.json
    uuid = data.get("uuid")
    code = data.get("code")

    if code != load_json("code.json").get("code"):
        return jsonify({"error": "Wrong code"}), 403

    users = load_json("users.json")
    pro_emails = set(load_email_list())

    # Get email by UUID
    email = next((k for k, v in users.items() if v == uuid), None)
    if not email:
        return jsonify({"error": "Invalid UUID"}), 403

    if email not in pro_emails:
        return jsonify({"error": "Not a patreon"}), 403

    return jsonify({"status": "ok"})
