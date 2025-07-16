import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { usePiano } from "../../PianoContext";

export default function Record() {
    const {
        recordingNotes, setRecordingNotes,
        audioRef, setRecordingTime, setIsPlaying, pianoSounds, playback, rafRef, partRef, resetPlayback
    } = usePiano();

    const [recording, setRecording] = useState(false);
    const [savedRecordings, setSavedRecordings] = useState([]);

    const midiAccessRef = useRef(null);
    const activeNotesRef = useRef(new Map());
    const recordedNotesRef = useRef([]);
    const recordedPedalRef = useRef([]);
    const recordingStartRef = useRef(0);


    useEffect(() => {
        audioRef.current.pause();
        setIsPlaying(false);

        navigator.requestMIDIAccess?.().then(
            (midiAccess) => {
                midiAccessRef.current = midiAccess;
            },
            () => alert("⚠️ MIDI Access Denied.")
        );
    }, []);

    const startRecording = async () => {
        setRecordingNotes(null);
        if (!midiAccessRef.current) return;

        await Tone.start();
        recordedNotesRef.current = [];
        recordedPedalRef.current = [];
        activeNotesRef.current = new Map();
        recordingStartRef.current = performance.now() / 1000;
        setRecording(true);

        for (const input of midiAccessRef.current.inputs.values()) {
            input.onmidimessage = handleMIDIMessage;
        }
    };

    const stopRecording = () => {
        setRecording(false);
        for (const input of midiAccessRef.current.inputs.values()) {
            input.onmidimessage = null;
        }

        const notes = recordedNotesRef.current;
        const pedal = recordedPedalRef.current;

        if (notes.length === 0) return;

        const earliestNoteTime = Math.min(...notes.map(n => n.time));
        const earliestPedalTime = pedal.length ? Math.min(...pedal.map(p => p.time)) : Infinity;
        const earliestTime = Math.min(earliestNoteTime, earliestPedalTime);
        const delayStart = 1;
        const shift = earliestTime - delayStart;

        const shiftedNotes = notes.map(n => ({ ...n, time: Math.max(0, n.time - shift) }));
        const shiftedPedal = pedal.map(p => ({ ...p, time: Math.max(0, p.time - shift) }));

        const newRecording = { notes: shiftedNotes, pedal: shiftedPedal };
        setRecordingNotes(newRecording);

        const existing = JSON.parse(localStorage.getItem("recordings") || "[]");
        existing.push({
            id: Date.now(),
            label: `Recording ${existing.length + 1}`,
            data: newRecording
        });
        localStorage.setItem("recordings", JSON.stringify(existing));
        console.log("🛑 Saved Recording", newRecording);
    };

    const handleMIDIMessage = ({ data }) => {
        const [status, data1, data2] = data;
        const now = performance.now() / 1000;
        const relTime = now - recordingStartRef.current;

        if (status >= 176 && status < 192 && data1 === 64) {
            const isDown = data2 >= 64;
            recordedPedalRef.current.push({ time: relTime, down: isDown });
            return;
        }

        if (status === 144 && data2 > 0) {
            activeNotesRef.current.set(data1, relTime);
        }

        if ((status === 128 || (status === 144 && data2 === 0)) && activeNotesRef.current.has(data1)) {
            const start = activeNotesRef.current.get(data1);
            const duration = relTime - start;
            recordedNotesRef.current.push({
                midi: data1,
                time: start,
                duration,
                velocity: data2 / 127,
                track: 0
            });

            activeNotesRef.current.delete(data1);
        }
    };




    useEffect(() => {
        const recs = JSON.parse(localStorage.getItem("recordings") || "[]");
        setSavedRecordings(recs);
    }, [recordingNotes]);

    const loadRecording = (data) => {
        resetPlayback();
        setRecordingNotes(data);
    };

    const deleteRecording = (id) => {
        const updated = savedRecordings.filter(r => r.id !== id);
        setSavedRecordings(updated);
        localStorage.setItem("recordings", JSON.stringify(updated));
    };


    useEffect(() => {
        return () => {
            resetPlayback(); // Cleanup when component unmounts
        };
    }, []);


    return (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
            {recording ? (
                <button onClick={stopRecording}>⏹️ Stop</button>
            ) : (
                <button onClick={startRecording} disabled={recording}>
                    ▶️ Start Recording
                </button>
            )}

            <div id="saved-recordings">
                {savedRecordings.map((rec) => (
                    <div key={rec.id}>
                        <button onClick={() => loadRecording(rec.data)}>
                            {rec.label}
                        </button>
                        <button onClick={() => deleteRecording(rec.id)}>
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
