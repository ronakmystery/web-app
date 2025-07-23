
import { useState, useEffect } from "react";
import { usePiano } from "../PianoContext";

import "./Settings.css";

import { motion } from "framer-motion";

export default function Settings() {

    const { userid, email, files, offset, setoffset, setScrollSpeed, setPianoHeight, scrollSpeed, pianoHeight, setShowSettings, isPortrait, setIsPortrait } = usePiano();



    return (
        <motion.div id="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
                width: isPortrait ? "100%" : "300px",
                height: isPortrait ? "300px" : "100%"
            }}
        >



            {userid && <div>

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
                    ⭐ {email}
                </button>


            </div>
            }

            <div id="controls">
                🔄 Autoscroll Offset

                <div>
                    <button onClick={() => setoffset(offset - 10)}>➖</button>
                    <button onClick={() => setoffset(0)}>{offset}</button>
                    <button onClick={() => setoffset(offset + 10)}>➕</button>


                </div>
                ↕️ Note Density

                <div>
                    <button onClick={() => setScrollSpeed(s => Math.max(5, s - 5))}>➖</button>
                    <button onClick={() => setScrollSpeed(0)}> {scrollSpeed}</button>
                    <button onClick={() => setScrollSpeed(s => s + 5)}>➕</button>
                </div>
                🎹 Piano height

                <div>
                    <button onClick={() => setPianoHeight(h => Math.max(5, h - 5))}>➖</button>
                    <button onClick={() => setPianoHeight(0)}> {pianoHeight}</button>
                    <button onClick={() => setPianoHeight(h => h + 5)}>➕</button>
                </div>

            </div>

            <div
                id="close-settings-button"
                onClick={() => {
                    setShowSettings(false);
                }}>
                ↩️
            </div>



        </motion.div>
    );
}
