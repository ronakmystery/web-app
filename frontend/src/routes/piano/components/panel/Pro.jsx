import { useRef, useEffect, useState } from "react";

import { usePiano } from "../../PianoContext"

import "./Pro.css"


export default function Pro({ visible, setLayer }) {



    const { loadMidi } = usePiano()



    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [userid, setUserid] = useState(null);
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
                    fileRef.current.value = "";
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
        } else {
            alert("❌ Failed to delete.");
        }
    };



    const [selectedFile, setSelectedFile] = useState(null);

    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");


    useEffect(() => {

        setLayer("pro");


        const uuid = localStorage.getItem("uuid");
        const code = localStorage.getItem("code");

        if (!uuid || !code) return;



        fetch("/backend/verify_uuid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uuid, code }),
        })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(() => {
                setUserid(uuid);
                setCode(code);
                setStatus("");
            })
            .catch(() => {
                localStorage.removeItem("uuid");
                localStorage.removeItem("code");
                setStatus("Auto-login failed...");
            });
    }, []);



    const handleLogin = async () => {

        const res = await fetch("/backend/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, password }),
        });

        const data = await res.json();

        if (data?.status === "pro_verified") {
            localStorage.setItem("uuid", data.uuid);
            localStorage.setItem("code", code);
            setUserid(data.uuid);
            setStatus("");
        } else {
            setStatus(data.error);
        }
    };



    return (
        <div id="pro"
            style={{ display: visible ? "block" : "none" }}>

            {
                !userid && <div
                    id="pro-login"
                >


                    <h3>🔓 Unlock Pro Mode</h3>

                    <input
                        type="password"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Code"
                    />

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Username"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                    <button onClick={() => handleLogin()}
                    >
                        🔑 Login
                    </button>
                    {status && <p className="status">🚷{status}</p>}
                    <div id="about">

                        <p>
                            🧑‍💻 PRO users have access to these features
                        </p>
                        <div id="pro-features">
                            <div>📤 Upload your own midi files</div>
                            <div>🔁 Reverse the midi file</div>
                            <div>🎮 Retro gameboy-style soundfont option</div>
                        </div>

                        Get code by supporting me on Patreon!
                        <a href="https://www.patreon.com/ronakmystery" className="app-link"
                            target='_blank' >
                            <button>🔓 PATREON</button>
                        </a>

                    </div>



                </div>
            }



            {
                userid && <div id="pro-user">



                    <div id="user-buttons">

                        <button onClick={() => document.getElementById('uploadDialog').showModal()}>
                            📂 Upload MIDI
                        </button>


                        <dialog id="uploadDialog">

                            <form
                                method="dialog"
                                onSubmit={handleUpload}
                                id="upload-form"
                            >
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
                                        }
                                    }}
                                />

                                <div id="upload-options">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={retro}
                                            onChange={(e) => setRetro(e.target.checked)}
                                        />🎮 Retro Sound
                                    </label>

                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={reverse}
                                            onChange={(e) => setReverse(e.target.checked)}
                                        />🔁 Reverse
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                >
                                    {uploading ? "🔄 Processing..." : "📤 UPLOAD"}
                                </button>

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


                        <button
                            id="logout-button"
                            onClick={() => {
                                if (window.confirm("Are you sure you want to log out?")) {
                                    localStorage.removeItem("uuid");
                                    localStorage.removeItem("code");
                                    window.location.reload();
                                }
                            }}
                        >
                            LOGOUT
                        </button>


                    </div>



                    {files.length === 0 ? (
                        <p>No MIDI files...</p>
                    ) : (
                        (() => {
                            let holdTimeout = null;

                            return (
                                <div id="user-files">
                                    {files.map((name) => (
                                        <button
                                            className={`user-midi ${selectedFile === name ? "selected-user-midi" : ""}`}
                                            key={name}
                                            onClick={() => {
                                                setSelectedFile(name);
                                                loadMidi(`/backend/converted/${userid}/${name}.mid`);
                                            }}

                                        >
                                            {name}

                                            {selectedFile === name &&
                                                <div
                                                    className="delete-button "
                                                    onClick={() => handleDelete(name)}>
                                                    <span className="delete-icon">🗑️</span  >

                                                </div>
                                            }
                                        </button>
                                    ))}
                                </div>
                            );
                        })()
                    )}





                </div>



            }






        </div>
    );
}
