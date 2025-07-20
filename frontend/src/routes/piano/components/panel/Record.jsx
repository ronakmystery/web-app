import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { usePiano } from "../../PianoContext";

import "./Record.css";

export default function Record() {
    const {
        recordingNotes, setRecordingNotes,
        audioRef, setRecordingTime, setIsPlaying, pianoSounds, playback, rafRef, partRef, resetPlayback,
        userid, fetchRecordings, selectedRecording, setSelectedRecording,
        recording, setRecording, recordings, setRecordings
    } = usePiano();

    const [savedRecordings, setSavedRecordings] = useState([]);

    const midiAccessRef = useRef(null);
    const activeNotesRef = useRef(new Map());
    const recordedNotesRef = useRef([]);
    const recordedPedalRef = useRef([]);
    const recordingStartRef = useRef(0);

    useEffect(() => {
        const initMIDI = async () => {
            if (!navigator.requestMIDIAccess) {
                alert("⚠️ Your browser does not support Web MIDI.");
                return;
            }

            try {
                const midiAccess = await navigator.requestMIDIAccess({ sysex: false });
                midiAccessRef.current = midiAccess;

                // Optional: listen for device changes
                midiAccess.onstatechange = (e) => {
                    console.log("🔄 MIDI device state changed:", e.port.name, e.port.state);
                };
            } catch (err) {
                console.error("⚠️ MIDI access error:", err);
                alert("⚠️ MIDI Access was denied or blocked.");
            }
        };

        initMIDI();
    }, []);



    const startRecording = async () => {
        setRecordingNotes(null);

        const midiAccess = midiAccessRef.current;
        if (!midiAccess || midiAccess.inputs.size === 0) {
            return alert("⚠️ No MIDI device connected. Please connect a keyboard and try again.");
        }

        try {
            await Tone.start(); // Needed for browser audio context
        } catch (err) {
            console.error("⚠️ Tone.js could not start:", err);
            return alert("⚠️ Audio could not start. Please interact with the page first.");
        }

        recordedNotesRef.current = [];
        recordedPedalRef.current = [];
        activeNotesRef.current = new Map();
        recordingStartRef.current = performance.now() / 1000;
        setRecording(true);

        for (const input of midiAccess.inputs.values()) {
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
        const shift = earliestTime;

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
        setRecordingNotes(null);
        const updated = savedRecordings.filter(r => r.id !== id);
        setSavedRecordings(updated);
        localStorage.setItem("recordings", JSON.stringify(updated));
    };





    const uploadRecordingJSON = async (rec) => {
        let label = prompt("Enter a title for your recording:");
        if (!label) {
            return;
        }

        label = label.slice(0, 50);


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
                deleteRecording(rec.id);
                fetchRecordings();
                setRecordingNotes(null);
                setSelectedRecording(null);

            } else {
                console.error("❌ Upload failed:", data);
            }
        } catch (err) {
            console.error("❌ Upload error:", err);
        }
    };




    useEffect(() => {
        if (userid) fetchRecordings();
    }, [userid]);




    const deleteUploadedRecording = async (recordingId) => {
        const res = await fetch(`/backend/recordings/${userid}/${recordingId}`, {
            method: "DELETE"
        });
        const result = await res.json();

        if (res.ok) {
            fetchRecordings()
            setRecordingNotes(null);
            setSelectedRecording(null);
            resetPlayback();
        }
    };



    return (
        <div id="record">

            <div id="recording-buttons">    {recording ? (
                <button onClick={stopRecording}>🛑 STOP</button>
            ) : (
                <button onClick={startRecording} disabled={recording}>
                    ⏺️ RECORD
                </button>
            )}</div>


            <div id="saved-recordings">
                {
                    savedRecordings.length === 0 && (
                        <div className="no-recordings">No local recordings...</div>
                    )
                }


                {
                    savedRecordings
                        .sort((a, b) => b.id - a.id)
                        .map((rec) => (
                            <div key={rec.id} className={`recording ${selectedRecording === rec.id ? "selected-recording" : ""}`}

                                onClick={() => {
                                    loadRecording(rec.data);
                                    setSelectedRecording(rec.id);
                                }}
                            >

                                <div className="recording-label">{rec.label}</div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!window.confirm(`Delete? ${rec.label}`)) return;
                                        deleteRecording(rec.id);
                                    }}>
                                    🗑️ DELETE
                                </button>

                                {
                                    userid && <button onClick={() => uploadRecordingJSON(rec)}>
                                        📤 UPLOAD
                                    </button>
                                }

                            </div>
                        ))}

                {
                    userid && recordings.length === 0 && (
                        <div className="no-recordings">No uploaded recordings...</div>
                    )
                }


                {[...recordings]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((rec) => (
                        <div
                            key={rec.id}
                            className={`recording ${selectedRecording === rec.id ? "selected-recording" : ""}`}
                            onClick={() => {
                                setRecordingNotes(rec.data);
                                setSelectedRecording(rec.id);
                            }}
                        >
                            <div className="recording-label">{rec.label}</div>
                            <div className="recording-likes">
                                {rec.likes ?? 0} ❤️
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete "${rec.label}"?`)) {
                                        deleteUploadedRecording(rec.id);
                                    }
                                }}
                            >
                                🗑️ DELETE
                            </button>
                        </div>
                    ))}

            </div>


        </div>
    );
}
