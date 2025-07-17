import { useEffect, useState } from "react";

import { usePiano } from "../../../PianoContext";
export default function ProRecordings() {

    const { userid, setRecordingNotes, recordings, setRecordings, fetchRecordings, selectedRecording, setSelectedRecording } = usePiano();


    const deleteRecording = async (recordingId) => {
        const res = await fetch(`/backend/recordings/${userid}/${recordingId}`, {
            method: "DELETE"
        });
        const result = await res.json();

        if (res.ok) {
            setRecordings((prev) => prev.filter(r => r.id !== recordingId));
        }
    };

    useEffect(() => {
        if (userid) fetchRecordings();
    }, [userid]);

    return (
        <div id="pro-recordings">
            pro recordings
            {recordings
                .sort((a, b) => b.datetime - a.datetime) // newest first
                .map((rec) => (
                    <div key={rec.id} >
                        <button
                            className={`recording ${selectedRecording === rec.id ? "selected-recording" : ""}`}
                            onClick={async () => {
                                setRecordingNotes(rec.data);
                                setSelectedRecording(rec.id);
                            }}>
                            ▶️ {rec.label}
                        </button>
                        <button onClick={() => deleteRecording(rec.id)}>
                            🗑️
                        </button>
                    </div>
                ))}
        </div>
    );
}
