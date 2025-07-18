import { useState, useEffect } from "react";
import { usePiano } from "../PianoContext"

import Composers from "./panel/Composers";
import ComposerPieces from "./panel/ComposerPieces";
import Pro from "./panel/Pro"
import Settings from "./panel/Settings"
import Record from "./panel/Record";
import Community from "./panel/Community";

import "./Panel.css"

import { motion } from "framer-motion";

const Samples = () => (
    <div id="samples">
        <div
            id="samples-container"
        >
            <Composers />
            <ComposerPieces />
        </div>


    </div>
);

export default function Panel({ setPanelState, setCanvasWidth }) {


    const { setPianoHeight, setScrollSpeed, isPlaying, setNotes, audioRef, setSelectedMidiPath, layer, setLayer, recording, userid } = usePiano()

    const layers = {
        "samples": <Samples />,
        "pro": <Pro />,
        "record": <Record />,
        ...(userid && {
            "community": <Community />,
            "settings": <Settings />
        })
    };




    const layerNames = {
        "samples": "🎶",
        "pro": "🧑‍💻",
        "record": "🎤",
        "community": "🌍",
        "settings": "⚙️",
    };



    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    useEffect(() => {
        const update = () => setIsPortrait(window.innerHeight > window.innerWidth);
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);



    return (
        <motion.div
            id="panel"
            initial={isPortrait ? { y: -200, opacity: 0 } : { x: 200, opacity: 0 }}
            animate={isPortrait ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isPortrait ? { y: -200, opacity: 0 } : { x: 200, opacity: 0 }}
            transition={{ duration: 0.3 }}
        >



            <div id="select-layer">
                {
                    Object.keys(layers).map((key) => (
                        <button key={key} onClick={() => {
                            setLayer(key)


                        }

                        }
                            className={layer === key ? "selected-layer" : ""}
                        >
                            {layer === key ? (
                                layerNames[key]
                            ) : (
                                <>
                                    {layerNames[key]}
                                </>
                            )}
                        </button>
                    ))
                }

                <div id="app-updates"> 📦 v1.3</div>

            </div>



            <div id="current-layer">
                {layers[layer]}
            </div>




            <div id="controls">


                <div>
                    <button onClick={() => setScrollSpeed(s => s + 5)}>➕</button>↕️
                    <button onClick={() => setScrollSpeed(s => Math.max(5, s - 5))}>➖</button>
                </div>


                <div
                >

                    <img
                        className={`${isPlaying ? 'playing-glow' : ''} ${recording ? 'recording-glow' : ''}`}

                        id="close-panel"
                        src="logo.png"
                        style={{
                            objectFit: "contain",
                            transformOrigin: "center center",
                        }}
                    />

                </div>



                <div>
                    <button onClick={() => setPianoHeight(h => h + 5)}>➕</button>🎹
                    <button onClick={() => setPianoHeight(h => Math.max(5, h - 5))}>➖</button>
                </div>

            </div>




        </motion.div>)

}