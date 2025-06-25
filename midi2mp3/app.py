from flask import Flask, request, send_file, jsonify
import os
import uuid
import subprocess

app = Flask(__name__)
UPLOAD_FOLDER = "converted"
SF2_PATH = "piano.sf2"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


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
    file = request.files['file']
    print(file)
    if not file or not file.filename.endswith('.mid'):
        return "Only .mid files allowed", 400

    uid = str(uuid.uuid4())
    midi_path = os.path.join(UPLOAD_FOLDER, f"{uid}.mid")
    wav_path = os.path.join(UPLOAD_FOLDER, f"{uid}.wav")
    mp3_path = os.path.join(UPLOAD_FOLDER, f"{uid}.mp3")

    file.save(midi_path)

    # Convert MIDI → WAV
    subprocess.run(["fluidsynth", "-ni", SF2_PATH, midi_path, "-F", wav_path, "-r", "44100"], check=True)

    # Convert WAV → MP3 using ffmpeg
    subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-codec:a", "libmp3lame", "-qscale:a", "2", mp3_path], check=True)
    print(mp3_path)

    return "converting"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
