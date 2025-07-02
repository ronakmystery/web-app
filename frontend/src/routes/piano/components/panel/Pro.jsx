import { useRef, useEffect, useState } from "react";

import { usePiano } from "../../PianoContext"

import "./Pro.css"


export default function Pro({ visible, setLayer }) {



    const { loadMidi } = usePiano()



    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
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
            setFiles(data.filter((f) => f.userid === userid));
        } catch (err) {
            console.error("❌ Error fetching files:", err);
        } finally {
            setLoading(false);
        }
    };





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
            setFiles((prev) => prev.filter((f) => f.id !== id));
        } else {
            alert("❌ Failed to delete.");
        }
    };



    const [selectedFile, setSelectedFile] = useState(null);

    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");
    const [code, setCode] = useState("");

    useEffect(() => {
        const savedEmail = localStorage.getItem("user_email");
        const savedCode = localStorage.getItem("pro_code");

        if (savedEmail && savedCode) {


            setEmail(savedEmail);
            setCode(savedCode);
            handleLogin(savedEmail, savedCode);

            setLayer("pro");

            fetchFiles(userid);
        }
    }, [userid]);


    const handleLogin = async (emailArg, codeArg) => {
        const loginEmail = emailArg ?? email;
        const loginCode = codeArg ?? code;

        setStatus("Checking...");

        const res = await fetch("/backend/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: loginEmail, code: loginCode }),
        });

        const data = await res.json();

        if (data?.status === "pro_verified") {
            setUserid(data.uuid);
            localStorage.setItem("user_email", loginEmail);
            localStorage.setItem("pro_code", loginCode);
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
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="PATREON email"
                    />
                    <input
                        type="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="CODE"
                    />
                    <button onClick={() => handleLogin()}
                    >
                        Login
                    </button>
                    {
                        (status === "❌ error") && (
                            <div>
                                Invalid code, grab the latest version from
                                <a href="https://www.patreon.com/ronakmystery" className="app-link"
                                    target='_blank' >
                                    <button>PATREON</button>
                                </a>
                            </div>

                        )
                    }
                </div>
            }


            {
                userid && <div id="pro-user">

                    <button onClick={() => document.getElementById('uploadDialog').showModal()}>
                        📤 Upload MIDI
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

                            <button onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('uploadDialog').close()
                            }}>
                                CLOSE
                            </button>


                        </form>
                    </dialog>




                    {loading ? (
                        <p>Loading...</p>
                    ) : files.length === 0 ? (
                        <p>No MIDI files...</p>
                    ) : (
                        <div id="user-files">
                            {files.map((f) => (

                                <button key={f.id}
                                    onClick={() => {
                                        setSelectedFile(f.id);
                                        loadMidi(`/backend/converted/${userid}/${f.id}.mid`)
                                    }
                                    }
                                    className={`user-midi ${selectedFile === f.id ? "selected-user-midi" : ""}`}

                                    onContextMenu={(e) => {
                                        e.preventDefault(); // Prevent the browser's context menu
                                        if (window.confirm(`Delete "${f.id}"?`)) {
                                            handleDelete(f.id);
                                        }
                                    }}
                                    onTouchStart={() => {
                                        f._holdTimeout = setTimeout(() => handleDelete(f.id), 300);
                                    }}
                                    onTouchEnd={() => clearTimeout(f._holdTimeout)}
                                    onTouchCancel={() => clearTimeout(f._holdTimeout)}
                                > 🎵 {f.id}
                                </button>



                            ))}
                        </div>
                    )}


                    <button id="logout-button"
                        onClick={() => {
                            setUserid(null);
                            localStorage.removeItem("user_email");
                            localStorage.removeItem("pro_code");
                        }}
                    >LOGOUT</button>

                </div>



            }






        </div>
    );
}
