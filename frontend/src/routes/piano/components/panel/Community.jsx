import { useEffect, useState } from "react";
import { usePiano } from "../../PianoContext";

import "./Community.css";

export default function Community() {
    const [recordings, setRecordings] = useState([]);
    const [selectedRecording, setSelectedRecording] = useState(null);

    const { setRecordingNotes, resetPlayback, userid } = usePiano();


    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!userid) return;

        setLoading(true);
        fetch("/backend/recordings/latest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userid })
        })
            .then(res => res.json())
            .then((data) => {
                setRecordings(data);
                setLoading(false);
            })
            .catch(err => console.error("❌ Failed to load community recordings:", err));
    }, [userid]);

    useEffect(() => {
        return () => {
            setSelectedRecording(null);
            setRecordingNotes(null);
            resetPlayback(); // Cleanup when component unmounts
        };
    }, []);

    return (
        <div id="community">

            <div id="pro-recordings">  {
                userid ? (
                    recordings.length === 0 ? (
                        <div id="no-uploads">{loading ? "Loading..." : "No pro uploads... "}</div>
                    ) : (
                        recordings
                            .sort((a, b) => b.timestamp - a.timestamp)
                            .map((rec) => (
                                <div key={rec.id}
                                    className={`recording ${selectedRecording === rec.id ? "selected-recording" : ""}`}
                                    onClick={() => {
                                        setRecordingNotes(rec.data);
                                        setSelectedRecording(rec.id);
                                    }}
                                >
                                    <div className="recording-label">{rec.label}</div>
                                    <div className="recording-user">by <em >{rec.user}</em></div>
                                    <div className="recording-timestamp">
                                        {new Date(rec.timestamp * 1000)
                                            .toLocaleString("en-US", {
                                                weekday: "short",      // Mon
                                                hour: "numeric",       // 3
                                                minute: "2-digit",     // 23
                                                hour12: true           // pm
                                            })

                                        } {new Date(rec.timestamp * 1000).toLocaleDateString("en-US", {
                                            month: "short",        // Mar
                                            day: "numeric"         // 18
                                        })}
                                    </div>



                                </div>
                            ))
                    )
                ) : (
                    <div>Please log in to view community recordings.</div>
                )
            }</div>


        </div>
    );
}
