import { useEffect, useState } from "react";


import { usePiano } from "../../PianoContext";


export default function Community() {
    const [recordings, setRecordings] = useState([]);
    const { setRecordingNotes, resetPlayback } = usePiano();

    const [selectedRecording, setSelectedRecording] = useState(null);

    useEffect(() => {
        fetch("/backend/recordings/latest")
            .then(res => res.json())
            .then(setRecordings)
            .catch(err => console.error("❌ Failed to load community recordings:", err));
    }, []);


    useEffect(() => {
        return () => {
            setSelectedRecording(null);
            setRecordingNotes(null);
            resetPlayback(); // Cleanup when component unmounts
        };
    }, []);

    return (
        <div id="community">

            {recordings.length === 0 ? (
                <p>No pro uploads yet.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {recordings
                        .sort((a, b) => b.timestamp - a.timestamp) // newest first
                        .map((rec) => (
                            <li
                                key={rec.id}

                            >
                                <div><strong>{rec.label}</strong></div>
                                <div>by <em>{rec.user}</em></div>
                                <div>{new Date(rec.timestamp * 1000).toLocaleString()}</div>
                                <button
                                    className={`recording ${selectedRecording === rec.id ? "selected-recording" : ""}`}
                                    onClick={() => {
                                        setRecordingNotes(rec.data);
                                        setSelectedRecording(rec.id);
                                    }}
                                >
                                    ▶️ Load
                                </button>
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
}
