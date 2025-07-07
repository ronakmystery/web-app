import os, json

MIDI_ROOT = "samples"
OUTPUT_JSON = "midis.json"

collections = {}

for root, _, files in os.walk(MIDI_ROOT):
    for f in files:
        if f.endswith(".mid"):
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, ".")
            parent_folder = os.path.basename(root).lower()

            item = {
                "path": "/" + rel_path.replace("\\", "/")
            }

            if parent_folder not in collections:
                collections[parent_folder] = []
            collections[parent_folder].append(item)

with open(OUTPUT_JSON, "w") as f:
    json.dump(collections, f, indent=2)
