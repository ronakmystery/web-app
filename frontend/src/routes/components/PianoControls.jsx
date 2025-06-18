import React, { useState, useEffect } from "react";
import { Midi } from "@tonejs/midi";
import SelectMidi from "./SelectMidi";

export default function PianoControls({ pianoHeight, setPianoHeight, scrollSpeed, setScrollSpeed, setNotes, setHighlightHeight, audioRef }) {

    const [selectedMidiPath, setSelectedMidiPath] = useState("/midis/chopin/N1.mid");


    const parseMidi = (midi) => {

        let savedScrollSpeed = localStorage.getItem("scrollSpeed");

        const allNotes = [];
        midi.tracks.forEach((track, trackIndex) => {
            track.notes.forEach((note) => {
                allNotes.push({
                    midi: note.midi,
                    time: note.time,
                    duration: note.duration,
                    track: trackIndex, // ✅ Use this, not note.trackIndex
                });
            });
        });

        setNotes(allNotes);


        setScrollSpeed(parseInt(savedScrollSpeed) || 100);


    };

    const loadMidi = async (path) => {
        const res = await fetch(path);
        const buffer = await res.arrayBuffer();
        const midi = new Midi(buffer);
        parseMidi(midi);
        setSelectedMidiPath(path);
        localStorage.setItem("selectedMidiPath", path);
    };

    useEffect(() => {
        const saved = localStorage.getItem("selectedMidiPath");
        loadMidi(saved || "/midis/chopin/N1.mid");
    }, []);


    // ✅ Handle custom file
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const buffer = await file.arrayBuffer();
        const midi = new Midi(buffer);
        parseMidi(midi);
    };

    return (
        <div id="piano-controls">

            <audio
            style={{ display: "none" }}
                ref={audioRef}
                src={selectedMidiPath.replace("/midis/", "/mp3s/").replace(/\.mid$/, ".mp3")} controls />

            <div>
                🎹
                <button onClick={() => setPianoHeight((h) => h + 5)}>➕ </button>
                <button onClick={() => setPianoHeight((h) => Math.max(5, h - 5))}>➖ </button>
            </div>
            <div>
                🎵
                <button onClick={() => setScrollSpeed((s) => s + 5)}>➕ </button>
                <button onClick={() => setScrollSpeed((s) => Math.max(5, s - 5))}>➖  </button>
            </div>

            {/* <div>
                🔍
                <button onClick={() => setHighlightHeight((s) => s + 10)}>➕ </button>
                <button onClick={() => setHighlightHeight((s) => Math.max(10, s - 10))}>➖  </button>
            </div> */}



            <input type="file" id="upload-midi"
                accept=".mid,.midi,audio/midi"
                onChange={handleFileChange} />

            <SelectMidi
                parseMidi={parseMidi}
                loadMidi={loadMidi}
                selectedMidiPath={selectedMidiPath}
            />

        </div>
    );
}