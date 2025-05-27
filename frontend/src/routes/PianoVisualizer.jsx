import { useEffect, useState } from "react";
import { Midi } from "@tonejs/midi";
import PianoKeys from "./components/PianoKeys";
import Notes from "./components/Notes";

export default function PianoVisualizer() {
    const [notes, setNotes] = useState([]);
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
    const scrollSpeed = 100;
    const pianoHeight = 100;



    useEffect(() => {
        const update = () => setCanvasWidth(window.innerWidth);
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const parseMidi = (midi) => {
        const allNotes = [];
        midi.tracks.forEach((track) => {
            track.notes.forEach((note) => {
                allNotes.push({
                    midi: note.midi,
                    time: note.time,
                    duration: note.duration,
                });
            });
        });
        setNotes(allNotes);
    };

    // ✅ Load default MIDI on mount
    useEffect(() => {
        const loadDefault = async () => {
            const res = await fetch("/n1.mid");
            const buffer = await res.arrayBuffer();
            const midi = new Midi(buffer);
            parseMidi(midi);
        };
        loadDefault();
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
        <div id="piano-app">
            <input type="file" id="select-midi" accept=".mid" onChange={handleFileChange} />
            <PianoKeys width={canvasWidth} height={pianoHeight} />
            <Notes notes={notes} width={canvasWidth} scrollSpeed={scrollSpeed} />
        </div>
    );
}
