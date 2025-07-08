
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


    return (
        <div id="pro-login">
            🧑‍💻 PRO users have access to these features

            <div id="about">


                <div id="pro-features">
                    <div>📤 Upload your own midi files</div>
                    <div>🔁 Reverse the midi file</div>
                    <div>🎮 Retro gameboy-style soundfont option</div>
                    <div>📥 Download converted midis and mp3s</div>
                </div>

                🔑 Get latest key from
                <a href="https://www.patreon.com/ronakmystery" className="app-link"
                    target='_blank' >
                    <button>  PATREON</button>
                </a>

            </div>

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
                    🔒 LOGIN {status && <div>🚷{status}</div>}
                </button>


            </div>






        </div>
    )
}
