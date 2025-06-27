from flask import Flask, request, send_file, jsonify, Response
import os, uuid, subprocess, time
import threading

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024  

UPLOAD_FOLDER = "converted"
SF2_PATH = "piano.sf2"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)



# from datetime import datetime
# LOG_FILE = "visitors.log"
# @app.before_request
# def log_visitor():
#     ip = request.remote_addr
#     time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

#     log_line = f"{time_str} | {ip}\n"

#     with open(LOG_FILE, "a") as f:
#         f.write(log_line)

#     print(f"📘 Logged visit: {log_line.strip()}")

# @app.route("/visits")
# def show_logs():
#     if not os.path.exists(LOG_FILE):
#         return "No visits yet."
    
#     with open(LOG_FILE, "r") as f:
#         return "<br>".join(f.readlines())









@app.route("/status_stream/<uid>")
def stream(uid):
    def event_stream():
        status_file = os.path.join(UPLOAD_FOLDER, f"{uid}.status")
        while True:
            if os.path.exists(status_file):
                with open(status_file) as f:
                    status = f.read().strip()
                yield f"data: {status}\n\n"
                if status == "done":
                    break
            time.sleep(1)
    return Response(event_stream(), content_type="text/event-stream")

@app.route('/')
def test():
    return jsonify("server running")
    

@app.route('/converted/<filename>')
def serve_file(filename):
    path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(path):
        return "File not found", 404
    return send_file(path)


@app.route('/list')
def list_midis():
    files = os.listdir(UPLOAD_FOLDER)
    midi_ids = set(f.split('.')[0] for f in files if f.endswith('.mid'))

    result = [
        {
            "id": fid,
            "midi": f"/converted/{fid}.mid",
            "mp3": f"/converted/{fid}.mp3"
        } for fid in sorted(midi_ids)
    ]
    return jsonify(result)

@app.route('/upload', methods=['POST'])
def upload_midi():
    file = request.files.get('file')

    if not file or not file.filename.endswith('.mid'):
        return jsonify({
            "error": "InvalidFileType",
            "message": "Only .mid files are allowed"
        }), 400

    if file.content_type not in ['audio/midi', 'audio/x-midi', 'application/octet-stream']:
        return jsonify({
            "error": "InvalidContentType",
            "message": "MIME type must be audio/midi or similar"
        }), 400

    uid = str(uuid.uuid4())
    midi_path = os.path.join(UPLOAD_FOLDER, f"{uid}.mid")
    wav_path = os.path.join(UPLOAD_FOLDER, f"{uid}.wav")
    mp3_path = os.path.join(UPLOAD_FOLDER, f"{uid}.mp3")
    status_path = os.path.join(UPLOAD_FOLDER, f"{uid}.status")

    try:
        file.save(midi_path)
        with open(status_path, "w") as f:
            f.write("processing")

        subprocess.run(["fluidsynth", "-ni", SF2_PATH, midi_path, "-F", wav_path, "-r", "44100"], check=True)
        subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-codec:a", "libmp3lame", "-qscale:a", "2", mp3_path], check=True)

        with open(status_path, "w") as f:
            f.write("done")

        # Delayed cleanup
        def delayed_cleanup():
            time.sleep(2)
            for path in [wav_path, status_path]:
                if os.path.exists(path):
                    os.remove(path)

        threading.Thread(target=delayed_cleanup, daemon=True).start()

        return jsonify({
            "id": uid
        })

    except subprocess.CalledProcessError as e:
        return jsonify({
            "error": "ProcessingError",
            "message": f"Error during audio processing: {e}"
        }), 500

    except Exception as e:
        return jsonify({
            "error": "InternalError",
            "message": str(e)
        }), 500



@app.route("/delete/<uid>", methods=["DELETE"])
def delete_file(uid):
    base = os.path.join(UPLOAD_FOLDER, uid)
    removed = []

    for ext in [".mid",".mp3"]:
        path = f"{base}{ext}"
        if os.path.exists(path):
            os.remove(path)
            removed.append(path)

    return jsonify({"status": "deleted", "files": removed})

