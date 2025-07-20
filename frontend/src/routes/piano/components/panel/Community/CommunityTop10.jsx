import { useEffect, useState } from "react";

import { usePiano } from "../../../PianoContext";

export default function CommunityTop10() {
    const [recordings, setRecordings] = useState([]);
    const [selectedRecording, setSelectedRecording] = useState(null);
    const { setRecordingNotes, userid } = usePiano();
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (!userid) return;

        setLoading(true);
        fetch("/backend/recordings/top", {
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
            .catch(err => {
                console.error("❌ Failed to load community recordings:", err);
                setLoading(false);
            });
    }, [userid]);



    return (
        <div id="community-top10">
            {userid && (
                recordings.length === 0 ? (
                    <div id="no-uploads">{loading ? "Loading..." : "No pro uploads... "}</div>
                ) : (
                    recordings
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
                                <div className="recording-user">by <em>{rec.user}</em></div>
                                <div className="recording-timestamp">
                                    {new Date(rec.timestamp * 1000).toLocaleString("en-US", {
                                        weekday: "short",
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true
                                    })}{" "}
                                    {new Date(rec.timestamp * 1000).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric"
                                    })}
                                </div>

                                {
                                    <button
                                        className={`like-button ${rec.liked ? "liked" : ""}`}
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            fetch(`/backend/community/toggle-like/${rec.id}`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ uuid: userid })
                                            })
                                                .then(res => res.json())
                                                .then(data => {
                                                    setRecordings(prev =>
                                                        prev.map(r =>
                                                            r.id === rec.id
                                                                ? { ...r, likes: data.total, liked: data.status === "liked" }
                                                                : r
                                                        )
                                                    );
                                                });
                                        }}
                                    >
                                        {rec.liked ? "❤️" : "🤍"} {rec.likes}
                                    </button>
                                }
                            </div>
                        ))
                )
            )}
        </div>

    );

}