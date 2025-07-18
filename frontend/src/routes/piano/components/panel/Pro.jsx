import { useRef, useEffect, useState } from "react";

import { usePiano } from "../../PianoContext"

import "./Pro.css"

import Login from "./Login";


export default function Pro() {



    const { loadMidi, userid, files, setFiles, selectedMidiPath, setSelectedMidiPath, audioRef, setIsPlaying, setNotes } = usePiano()



    const [uploading, setUploading] = useState(false);
    const [reverse, setReverse] = useState(false);
    const [retro, setRetro] = useState(false);
    const fileRef = useRef(null);




    const fetchFiles = async () => {
        try {
            const res = await fetch(`/backend/list?uuid=${userid}`);

            if (!res.ok) throw new Error("Failed to load list");
            const data = await res.json();
            setFiles(data);
        } catch (err) {
            console.error("❌ Error fetching files:", err);
        }
    };

    useEffect(() => {
        if (userid) {

            fetchFiles();
        }
    }, [userid]);



    const handleUpload = async (e) => {

        e.preventDefault();
        const file = fileRef.current?.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("userid", userid);
        formData.append("reverse", reverse ? "true" : "false");
        formData.append("retro", retro ? "true" : "false");

        setUploading(true);

        try {
            const res = await fetch("/backend/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                alert(`❌ Upload failed: ${res.statusText}`);
                setUploading(false);
                return;
            }

            const { id } = await res.json();

            const stream = new EventSource(`/backend/status_stream/${userid}/${id}`);
            stream.onmessage = (e) => {
                if (e.data === "done") {
                    stream.close();
                    alert("Your MIDI file has been processed and is ready to play!");
                    setUploading(false);
                    if (fileRef.current) {
                        fileRef.current.value = "";
                    }
                    fetchFiles();
                } else {
                    alert(`Error: ${e.data}`);
                }
            };
        } catch (err) {
            alert("❌ Unexpected error");
            console.error(err);
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Delete? ${id}`)) return;

        const res = await fetch(`/backend/delete/${userid}/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            fetchFiles();
            audioRef.current.pause();
            setIsPlaying(false);
            setNotes([]);

        } else {
            alert("❌ Failed to delete.");
        }
    };




    useEffect(() => {
        return () => {
            audioRef.current.pause();
            setIsPlaying(false);
            setNotes([]);
            setSelectedMidiPath(null);
        };
    }, []);


    const [selectedFileName, setSelectedFileName] = useState("");


    return (
        <div id="pro">


            {
                !userid && <Login />
            }



            {
                userid && <div id="pro-user">



                    <div id="user-buttons">

                        <button onClick={() => document.getElementById('uploadDialog').showModal()}>
                            📤 MIDI Upload
                        </button>



                        <dialog id="uploadDialog">

                            <form
                                method="dialog"
                                onSubmit={handleUpload}
                                id="upload-form"
                            >
                                <label htmlFor="choose-file" className="styled-upload-button">
                                    {selectedFileName || "🎵 Choose MIDI"}
                                </label>

                                <input
                                    id="choose-file"
                                    type="file"
                                    name="file"
                                    ref={fileRef}
                                    accept=".mid,.midi,audio/midi"
                                    disabled={uploading}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file && file.size > 200 * 1024) {
                                            alert(`❌ File too large. Max allowed is 200KB.`);
                                            e.target.value = "";
                                            setSelectedFileName("");
                                        } else if (file) {
                                            setSelectedFileName(file.name);
                                        }
                                    }}
                                    style={{ display: "none" }}  // hide native input
                                />


                                <div id="upload-options">
                                    <div className="upload-info">   Saves midi to cloud to generate mp3 for playback</div>



                                    <button
                                        type="submit"
                                        disabled={uploading}
                                    >
                                        {uploading ? "🔄 Processing..." : "📤 UPLOAD"}
                                    </button>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={retro}
                                            onChange={(e) => setRetro(e.target.checked)}
                                        />🎮 Use retro soundfont
                                    </label>

                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={reverse}
                                            onChange={(e) => setReverse(e.target.checked)}
                                        />🔁 Reverse the notes
                                    </label>
                                </div>


                                <div
                                    id="close-dialog-button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('uploadDialog').close()
                                    }}>
                                    ↩️
                                </div>


                            </form>
                        </dialog>




                    </div>



                    {files.length === 0 ? (
                        <p>No MIDI files...</p>
                    ) : (
                        (() => {

                            return (
                                <div id="user-files">
                                    {files.map((name) => (
                                        <div
                                            className={`user-midi ${selectedMidiPath === `/backend/converted/${userid}/${name}.mid` ? "selected-user-midi" : ""}`}
                                            key={name}
                                            onClick={() => {
                                                loadMidi(`/backend/converted/${userid}/${name}.mid`);
                                            }}

                                        >
                                            {name}



                                            <div className="download-buttons">
                                                <a
                                                    href={`/backend/converted/${userid}/${name}.mp3`}
                                                    download
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <button>📥 MP3</button>

                                                </a>

                                                <a
                                                    href={`/backend/converted/${userid}/${name}.mid`}
                                                    download
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ marginLeft: "10px" }}
                                                >
                                                    <button> 📥 MIDI</button>
                                                </a>

                                                <button
                                                    className="delete-button "
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(name);
                                                    }}

                                                >
                                                    🗑️ Delete</button>
                                            </div>


                                        </div>
                                    ))}
                                </div>
                            );
                        })()
                    )}





                </div>



            }






        </div >
    );
}
