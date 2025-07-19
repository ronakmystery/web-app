import { useRef, useEffect, useState } from "react";

import { usePiano } from "../../PianoContext"

import "./Pro.css"

import Login from "./Login";


export default function Pro() {



    const { loadMidi, userid, files, setFiles, selectedMidiPath, setSelectedMidiPath, audioRef, setIsPlaying, setNotes, uploading, setUploading, handleUpload, fileRef, retro, setRetro, reverse, setReverse, fetchFiles } = usePiano()




    useEffect(() => {
        if (userid) {

            fetchFiles();
        }
    }, [userid]);





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



    const [selectedFileName, setSelectedFileName] = useState("");


    return (
        <div id="pro">


            {
                !userid && <Login />
            }



            {
                userid && <div id="pro-user">



                    <div id="user-buttons">

                        <button
                            onClick={() => document.getElementById('uploadDialog').showModal()}
                            disabled={uploading}
                        >
                            {uploading ? "🔄 Processing..." : "📤 MIDI UPLOAD"}
                        </button>




                        <dialog id="uploadDialog">

                            <form
                                method="dialog"
                                onSubmit={handleUpload}
                                id="upload-form"
                            >
                                <label htmlFor="choose-file" className="styled-upload-button">
                                    {selectedFileName || "🎵 CHOOSE MIDI"}
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



                                    <button
                                        type="submit"
                                        disabled={uploading}
                                    >
                                        {uploading ? "🔄 Processing..." : "📤 UPLOAD"}
                                    </button>

                                    <div className="upload-info">   Saves midi to cloud to generate mp3 for playback</div>

                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={retro}
                                            onChange={(e) => setRetro(e.target.checked)}
                                        />🎮 Use a retro soundfont
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


                    <div id="user-files">

                        {files.length === 0 && (
                            <div className="no-midi-files">
                                No MIDI files...
                            </div>
                        )}


                        {files
                            .slice()
                            .sort((a, b) => b.timestamp - a.timestamp) // newest first
                            .map((file) => {
                                const midiPath = `/backend/converted/${userid}/${file.id}.mid`;

                                return (
                                    <div
                                        className={`user-midi ${selectedMidiPath === midiPath ? "selected-user-midi" : ""
                                            }`}
                                        key={file.id}
                                        onClick={() => {
                                            loadMidi(midiPath);
                                        }}
                                    >
                                        {file.id}

                                        <div className="download-buttons">
                                            <a
                                                href={`/backend/converted/${userid}/${file.id}.mp3`}
                                                download
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <button>📥 MP3</button>
                                            </a>

                                            <a
                                                href={`/backend/converted/${userid}/${file.id}.mid`}
                                                download
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ marginLeft: "10px" }}
                                            >
                                                <button>📥 MIDI</button>
                                            </a>

                                            <button
                                                className="delete-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(file.id);
                                                }}
                                            >
                                                🗑️ DELETE
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>






                </div>



            }






        </div >
    );
}
