import { useEffect, useState } from "react";

import { usePiano } from "../../../PianoContext";

export default function CommunityHome() {

    const { setRecordingNotes, setSelectedRecording, resetPlayback, userid } = usePiano();
    const [loading, setLoading] = useState(false);


    const [randomRec, setRandomRec] = useState(null);
    const fetchRandom = () => {
        if (!userid) return;
        setLoading(true);

        fetch("/backend/community/random", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userid })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert("❌ " + data.error);
                    setRandomRec(null);
                    setLoading(false);
                    return;
                }
                setRandomRec(data);
                setRecordingNotes(data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("❌ Failed to fetch random recording:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchRandom();
    }, [userid]);

    useEffect(() => {
        return () => {
            setSelectedRecording(null);
            setRecordingNotes(null);
            resetPlayback();
        };
    }, []);

    return (
        <div id="community-home">

            <button onClick={fetchRandom} disabled={loading}>
                {loading ? "🎲 Loading..." : "🎲 Random recording"}
            </button>


            {randomRec && (
                <div id="random-recording"
                    className="recording selected-recording"
                >
                    <div className="recording-label">{randomRec.label}</div>
                    <div className="recording-user">by <em>{randomRec.user}</em></div>
                    <button
                        className={`like-button ${randomRec.liked ? "liked" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            fetch(`/backend/community/toggle-like/${randomRec.id}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ uuid: userid })
                            })
                                .then(res => res.json())
                                .then(data => {
                                    setRandomRec(prev =>
                                        prev.id === randomRec.id
                                            ? { ...prev, likes: data.total, liked: data.status === "liked" }
                                            : prev
                                    );
                                });
                        }}
                    >
                        {randomRec.liked ? "❤️" : "🤍"} {randomRec.likes}
                    </button>


                </div>
            )}
        </div>

    );

}