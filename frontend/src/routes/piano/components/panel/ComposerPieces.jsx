
import { usePiano } from "../../PianoContext"
import { useEffect, useState } from "react";

export default function ComposerPieces() {


    const { selectedMidiPath, selectedComposer, collection, loadMidi } = usePiano()




    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(true);     // for initial fetch


    const fetchFiles = async () => {
        try {
            const res = await fetch("/backend/list");
            if (!res.ok) throw new Error("Failed to load list");
            const data = await res.json();
            setFiles(data);
        } catch (err) {
            console.error("❌ Error fetching files:", err);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchFiles();
    }, []);


    return (
        <div id="composer-pieces">

            {collection &&
                collection[selectedComposer].map((item, i) => {
                    const fileName = item.path.split("/").pop().replace(".mid", "").replace("_", " ");
                    return (
                        <button key={i} onClick={() => loadMidi(item.path)}
                            id={`${item.path === selectedMidiPath ? "selected-midi" : ""}`}

                        >
                            🎵 {fileName}
                        </button>
                    );
                })


            }

            {loading ? (
                <p>Loading...</p>
            ) : files.length === 0 ? (
                <p>No MIDI files found.</p>
            ) : (
                <div>
                    {files.map((f) => {
                        const path = `/backend/converted/${f.id}.mid`;
                        return (
                            <button
                                key={f.id}
                                onClick={() => loadMidi(path)}
                            >
                                {f.id.replace(/_/g, " ")}
                            </button>
                        );
                    })}
                </div>
            )}



        </div>
    );
}
