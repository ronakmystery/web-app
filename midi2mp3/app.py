from flask import Flask, request, send_file, jsonify, Response
import os, uuid, subprocess, time
import threading
import json

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024  # 200 KB max upload

BASE_FOLDER = "data"
SF2_PATH = "sf2/wii.sf2"

os.makedirs(BASE_FOLDER, exist_ok=True)

@app.route('/')
def test():
    return jsonify("server running")


USERS_FILE = "users.json"
CODE_FILE = "code.json"

def load_json(path):
    if not os.path.exists(path):
        return {}
    with open(path, "r") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


@app.route("/verify", methods=["POST"])
def verify():
    data = request.json
    email = data.get("email")
    code = data.get("code")
    
    users = load_json(USERS_FILE)
    pro_code = load_json(CODE_FILE)

    if pro_code["code"] != code:
        return jsonify({"error": "Invalid code"}), 401

    if email not in users:
        users[email] = str(uuid.uuid4())
        save_json(USERS_FILE, users)

    return jsonify({"uuid": users[email], "status": "pro_verified"})

import pretty_midi

def reverse_midi(input_path):
    midi = pretty_midi.PrettyMIDI(input_path)
    total_time = midi.get_end_time()

    reversed_midi = pretty_midi.PrettyMIDI()
    for inst in midi.instruments:
        new_inst = pretty_midi.Instrument(program=inst.program, is_drum=inst.is_drum, name=inst.name)
        for note in inst.notes:
            new_note = pretty_midi.Note(
                velocity=note.velocity,
                pitch=note.pitch,
                start=total_time - note.end,
                end=total_time - note.start
            )
            new_inst.notes.append(new_note)
        reversed_midi.instruments.append(new_inst)

    reversed_midi.write(input_path)


@app.route('/upload', methods=['POST'])
def upload_midi():
    global SF2_PATH
    file = request.files.get('file')
    userid = request.form.get('userid')
    reverse_flag = request.form.get("reverse") == "true"
    retro_flag = request.form.get("retro") == "true"
    if retro_flag:
        SF2_PATH = "sf2/8b.sf2"
    else:
        SF2_PATH = "sf2/wii.sf2"

    if not file or not userid:
        return jsonify({"error": "MissingFileOrUser", "message": "Both file and userid are required"}), 400

    print(f"📥 Received file from user {userid}: {file.filename}")

    uid = str(uuid.uuid4())
    user_base = os.path.join(BASE_FOLDER, userid)
    working_folder = os.path.join(user_base, "working")
    final_folder = os.path.join(user_base, "processed", "converted")

    os.makedirs(working_folder, exist_ok=True)
    os.makedirs(final_folder, exist_ok=True)

    midi_path = os.path.join(working_folder, f"{uid}.mid")
    wav_path = os.path.join(working_folder, f"{uid}.wav")
    mp3_path = os.path.join(working_folder, f"{uid}.mp3")
    status_path = os.path.join(working_folder, f"{uid}.status")

    try:
        file.save(midi_path)

        # Check if reverse flag is set
        if request.form.get("reverse") == "true":
            reverse_midi(midi_path)

        with open(status_path, "w") as f:
            f.write("processing")

        subprocess.run(["fluidsynth", "-ni", SF2_PATH, midi_path, "-F", wav_path, "-r", "44100"], check=True)
        subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-codec:a", "libmp3lame", "-qscale:a", "2", mp3_path], check=True)

        with open(status_path, "w") as f:
            f.write("done")

        def delayed_cleanup():
            time.sleep(1)

            # Clean up intermediate files
            for path in [wav_path, status_path]:
                if os.path.exists(path):
                    os.remove(path)


            # Derive original base name (without extension)
            original_base = os.path.splitext(file.filename)[0]
            if reverse_flag:
                original_base += "_reversed"
            if retro_flag:
                original_base += "_retro"
            

            # Move and rename to original filename
            for ext in [".mid", ".mp3"]:
                src = os.path.join(working_folder, f"{uid}{ext}")
                dst = os.path.join(final_folder, f"{original_base}{ext}")
                if os.path.exists(src):
                    os.rename(src, dst)
                    print(f"✅ Moved {src} → {dst}")


        threading.Thread(target=delayed_cleanup, daemon=True).start()

        return jsonify({"id": uid})

    except subprocess.CalledProcessError as e:
        return jsonify({"error": "ProcessingError", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "InternalError", "message": str(e)}), 500


@app.route('/converted/<userid>/<filename>')
def serve_file(userid, filename):
    path = os.path.join(BASE_FOLDER, userid, "processed", "converted", filename)
    if not os.path.exists(path):
        return "File not found", 404
    return send_file(path)


@app.route('/status_stream/<userid>/<uid>')
def stream(userid, uid):
    status_file = os.path.join(BASE_FOLDER, userid, "working", f"{uid}.status")

    def event_stream():
        while True:
            if os.path.exists(status_file):
                with open(status_file) as f:
                    status = f.read().strip()
                yield f"data: {status}\n\n"
                if status == "done":
                    break
            time.sleep(1)

    return Response(event_stream(), content_type="text/event-stream")

@app.route('/list')
def list_user_midis():
    uuid = request.args.get("uuid")
    if not uuid:
        return jsonify({"error": "Missing uuid"}), 400

    user_folder = os.path.join(BASE_FOLDER, uuid, "processed", "converted")
    if not os.path.isdir(user_folder):
        return jsonify([])  # No files yet

    result = []
    for file in os.listdir(user_folder):
        if file.endswith(".mid"):
            name = os.path.splitext(file)[0]
            mp3_file = f"{name}.mp3"
            result.append({
                "userid": uuid,
                "id": name,
                "midi": f"/converted/{uuid}/{file}",
                "mp3": f"/converted/{uuid}/{mp3_file}" if os.path.exists(os.path.join(user_folder, mp3_file)) else None
            })

    return jsonify(sorted(result, key=lambda x: x["id"]))


@app.route("/delete/<userid>/<uid>", methods=["DELETE"])
def delete_file(userid, uid):
    converted_path = os.path.join(BASE_FOLDER, userid, "processed", "converted")
    removed = []

    # Remove files that start with uid or contain it as a hidden tag (if added later)
    for filename in os.listdir(converted_path):
        if uid in filename and filename.endswith(('.mid', '.mp3')):
            path = os.path.join(converted_path, filename)
            os.remove(path)
            removed.append(filename)

    return jsonify({"status": "deleted", "files": removed})
