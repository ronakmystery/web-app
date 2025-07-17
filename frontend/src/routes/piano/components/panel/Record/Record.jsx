import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { usePiano } from "../../../PianoContext";

import ProRecordings from "./ProRecordings";

import "./Record.css";

export default function Record() {
    const {
        recordingNotes, setRecordingNotes,
        audioRef, setRecordingTime, setIsPlaying, pianoSounds, playback, rafRef, partRef, resetPlayback,
        userid, fetchRecordings, selectedRecording, setSelectedRecording,
        recording, setRecording
    } = usePiano();

    const [savedRecordings, setSavedRecordings] = useState([]);

    const midiAccessRef = useRef(null);
    const activeNotesRef = useRef(new Map());
    const recordedNotesRef = useRef([]);
    const recordedPedalRef = useRef([]);
    const recordingStartRef = useRef(0);


    useEffect(() => {
        audioRef.current.pause();
        setIsPlaying(false);

        const initMIDI = async () => {
            if (!navigator.requestMIDIAccess) {
                alert("⚠️ Your browser does not support Web MIDI.");
                return;
            }

            try {
                const midiAccess = await navigator.requestMIDIAccess();
                midiAccessRef.current = midiAccess;
            } catch (err) {
                alert("⚠️ MIDI Access was denied by the user or blocked.");
            }
        };

        initMIDI();
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

        const existing = JSON.parse(localStorage.getItem("recordings") || "[]");

        const newRec = {
            id: Date.now(),
            label: `Recording ${existing.length + 1}`,
            data: newRecording
        };

        existing.push(newRec);
        localStorage.setItem("recordings", JSON.stringify(existing));

        setSelectedRecording(newRec.id);
        setRecordingNotes(newRecording);


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
        setRecordingNotes(data);
    };

    const deleteRecording = (id) => {
        const updated = savedRecordings.filter(r => r.id !== id);
        setSavedRecordings(updated);
        setRecordingNotes(null);
        localStorage.setItem("recordings", JSON.stringify(updated));
    };





    const uploadRecordingJSON = async (rec) => {
        const label = prompt("Enter a title for your recording:");
        if (!label) {
            console.log("⚠️ Upload canceled (no title).");
            return;
        }

        const formData = new FormData();
        formData.append("userid", userid);
        formData.append("recording", JSON.stringify(rec.data));
        formData.append("label", label);
        formData.append("datetime", rec.id);

        try {
            const res = await fetch("/backend/upload_recording", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if (data.status === "ok") {
                deleteRecording(rec.id); // ✅ Now this works
                fetchRecordings();
            } else {
                console.error("❌ Upload failed:", data);
            }
        } catch (err) {
            console.error("❌ Upload error:", err);
        }
    };


    useEffect(() => {
        return () => {
            setSelectedRecording(null);
            setRecordingNotes(null);
            resetPlayback(); // Cleanup when component unmounts
        };
    }, []);



    return (
        <div id="record">
            {recording ? (
                <button onClick={stopRecording}>⏹️ Stop</button>
            ) : (
                <button onClick={startRecording} disabled={recording}>
                    ▶️ Start Recording
                </button>
            )}

            <div id="saved-recordings">
                recordings
                {savedRecordings
                    .sort((a, b) => b.id - a.id)
                    .map((rec) => (
                        <div key={rec.id} >
                            <button
                                className={`recording ${selectedRecording === rec.id ? "selected-recording" : ""}`}
                                onClick={() => {
                                    loadRecording(rec.data);
                                    setSelectedRecording(rec.id);
                                }}>
                                {rec.label}
                            </button>
                            <button onClick={() => deleteRecording(rec.id)}>
                                🗑️
                            </button>
                            {
                                userid ? <button onClick={() => uploadRecordingJSON(rec)}>
                                    ⬆️
                                </button> : <div>Login to upload recordings</div>
                            }

                        </div>
                    ))}
            </div>

            {userid && <ProRecordings />}

        </div>
    );
}
