
import React, { useState, useEffect } from "react";
import { usePiano } from "../../PianoContext";
export default function Login() {

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




    const features = [
        { icon: "📤", text: "Upload your own MIDI files and apply special effects" },
        { icon: "📥", text: "Download the processed MIDIs and MP3s" },
        { icon: "❤️", text: "Upload your recordings to share them with the community" },
        { icon: "🌍", text: "Explore community recordings" },
        { icon: "🏆", text: "Monthly rankings for pros and recordings with the most likes" },
    ];

    return (
        <div id="pro-login">




            <a href="https://www.patreon.com/ronakmystery" className="app-link"
                target='_blank' >
                <button className="patreon-link">Get latest key from Patreon</button>
            </a>

            <div id="pro-inputs">  <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="🔑 Key"
            />

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="👨‍💻 Username"
                />

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="🔒 Password"
                />
                <button
                    id="login-button"
                    onClick={() => handleLogin()}
                >
                    🔒 LOGIN {status && <div className="login-error">🚷 {status}</div>}
                </button>


            </div>

            <div id="about">
                <div id="about-title">🧑‍💻 Pro features</div>

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
