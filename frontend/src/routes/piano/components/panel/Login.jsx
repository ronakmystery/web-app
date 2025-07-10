
import React, { useState, useEffect } from "react";
import { usePiano } from "../../PianoContext";
export default function Login({ setLayer }) {

    const { setUserid, email, setEmail } = usePiano();

    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");

    const [status, setStatus] = useState("");


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

    //autologin
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
            .then(async (res) => {
                if (!res.ok) throw new Error("Verification failed");
                return res.json();
            })
            .then((data) => {
                setUserid(uuid);
                setCode(code);
                setStatus(""); // clear status if previously failed
                if (data.email) {
                    setEmail(data.email);
                }
            })
            .catch(() => {
                localStorage.removeItem("uuid");
                localStorage.removeItem("code");
                setStatus("Auto-login failed...");
            });
    }, []);


    const features = [
        { icon: "📤", text: "Upload your own MIDI files" },
        { icon: "🔁", text: "Reverse the MIDI file" },
        { icon: "🎮", text: "Retro Gameboy-style soundfont" },
        { icon: "📥", text: "Download converted MIDIs and MP3s" },
    ];

    return (
        <div id="pro-login">



            🔑 Get latest key from
            <a href="https://www.patreon.com/ronakmystery" className="app-link"
                target='_blank' >
                <button>  PATREON</button>
            </a>

            <div id="pro-inputs">  <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Key"
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
                    🔒 LOGIN {status && <div className="login-error">🚷 {status}</div>}
                </button>


            </div>

            <div id="about">

                🧑‍💻 Pro features

                <div id="pro-features">
                    {features.map((item, index) => (
                        <div
                            key={index}
                            className="feature"
                        >
                            <div className="feature-icon">{item.icon}</div>
                            <div className="feature-text">{item.text}</div>
                        </div>
                    ))}
                </div>

            </div>





        </div>
    )
}
