
from flask import Blueprint, request, jsonify
from utils.helpers import load_json, save_json
import uuid

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

@admin_bp.route("/verify", methods=["POST"])
def admin_verify():
    data = request.json or {}
    admin = load_json("admin.json")
    if data.get("password") == admin.get("password"):
        return jsonify({"uuid": admin["uuid"]})
    return jsonify({"error": "Invalid password"}), 401

@admin_bp.route("/current_code", methods=["POST"])
def get_current_code():
    admin = load_json("admin.json")
    if request.json.get("uuid") != admin.get("uuid"):
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"code": load_json("code.json").get("code")})

@admin_bp.route("/update_code", methods=["POST"])
def update_code():
    admin = load_json("admin.json")
    if request.json.get("uuid") != admin.get("uuid"):
        return jsonify({"error": "Unauthorized"}), 401
    new_code = str(uuid.uuid4())[:7]
    save_json("code.json", {"code": new_code})
    return jsonify({"code": new_code})

@admin_bp.route("/list_emails", methods=["POST"])
def list_emails():
    admin = load_json("admin.json")
    data = request.json or {}

    if data.get("uuid") != admin.get("uuid"):
        return jsonify({"error": "Unauthorized"}), 401

    from utils.helpers import load_email_list
    emails = load_email_list()
    return jsonify({"emails": "\n".join(emails)})

@admin_bp.route("/update_emails", methods=["POST"])
def update_emails():
    admin = load_json("admin.json")
    data = request.json or {}

    if data.get("uuid") != admin.get("uuid"):
        return jsonify({"error": "Unauthorized"}), 401

    new_emails_str = data.get("emails", "")
    emails = [line.strip() for line in new_emails_str.splitlines() if line.strip()]

    with open("emails.txt", "w") as f:
        f.write("\n".join(sorted(set(emails))) + "\n")

    return jsonify({"status": "updated", "count": len(emails)})
