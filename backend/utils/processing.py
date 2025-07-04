from flask import jsonify
import os, uuid, subprocess, threading, time
import pretty_midi
from utils.helpers import load_json

def reverse_midi(input_path):
    midi = pretty_midi.PrettyMIDI(input_path)
    total_time = midi.get_end_time()

    reversed_midi = pretty_midi.PrettyMIDI()
    min_start = float('inf')
    for inst in midi.instruments:
        new_inst = pretty_midi.Instrument(program=inst.program, is_drum=inst.is_drum)
        for note in inst.notes:
            new_start = total_time - note.end
            new_end = total_time - note.start
            min_start = min(min_start, new_start)
            new_inst.notes.append(pretty_midi.Note(
                velocity=note.velocity,
                pitch=note.pitch,
                start=new_start,
                end=new_end
            ))
        reversed_midi.instruments.append(new_inst)

    # shift all notes so the first note starts at time 0
    for inst in reversed_midi.instruments:
        for note in inst.notes:
            note.start -= min_start
            note.end -= min_start

    reversed_midi.write(input_path)


def process_midi_upload(request):
    userid = request.form.get("userid")
    users = load_json("users.json")
    if userid not in users.values():
        return jsonify({"error": "Invalid user"}), 403

    file = request.files.get("file")
    if not file or not file.filename.endswith(".mid"):
        return jsonify({"error": "Invalid file type"}), 400

    reverse_flag = request.form.get("reverse") == "true"
    retro_flag = request.form.get("retro") == "true"
    sf2_path = "sf2/8b.sf2" if retro_flag else "sf2/wii.sf2"

    uid = str(uuid.uuid4())
    user_base = os.path.join("data", userid)
    working = os.path.join(user_base, "working")
    converted = os.path.join(user_base, "processed", "converted")
    os.makedirs(working, exist_ok=True)
    os.makedirs(converted, exist_ok=True)

    midi_path = os.path.join(working, f"{uid}.mid")
    wav_path = os.path.join(working, f"{uid}.wav")
    mp3_path = os.path.join(working, f"{uid}.mp3")
    status_path = os.path.join(working, f"{uid}.status")

    try:
        file.save(midi_path)
        midi = pretty_midi.PrettyMIDI(midi_path)
        for inst in midi.instruments:
            inst.program = 0
            for note in inst.notes:
                note.velocity = 113
        midi.write(midi_path)

        if reverse_flag:
            reverse_midi(midi_path)

        with open(status_path, "w") as f:
            f.write("processing")

        subprocess.run(["fluidsynth", "-ni", sf2_path, midi_path, "-F", wav_path, "-r", "44100"], check=True)
        subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-codec:a", "libmp3lame", "-qscale:a", "2", mp3_path], check=True)

        with open(status_path, "w") as f:
            f.write("done")

        def cleanup():
            time.sleep(1)
            for path in [wav_path, status_path]:
                if os.path.exists(path): os.remove(path)
            base = os.path.splitext(file.filename)[0]
            if reverse_flag: base += "_reversed"
            if retro_flag: base += "_retro"
            for ext in [".mid", ".mp3"]:
                src = os.path.join(working, f"{uid}{ext}")
                dst = os.path.join(converted, f"{base}{ext}")
                if os.path.exists(src): os.rename(src, dst)

        threading.Thread(target=cleanup, daemon=True).start()
        return jsonify({"id": uid})

    except subprocess.CalledProcessError:
        with open(status_path, "w") as f:
            f.write("failed")
        return jsonify({"error": "Processing error"}), 500

    except Exception:
        with open(status_path, "w") as f:
            f.write("failed")
        return jsonify({"error": "Internal error"}), 500
