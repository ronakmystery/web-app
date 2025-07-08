import { useState, useEffect } from "react";
import { usePiano } from "../PianoContext"

import Composers from "./panel/Composers";
import ComposerPieces from "./panel/ComposerPieces";
import Pro from "./panel/Pro"
import Settings from "./panel/Settings"

import "./Panel.css"

import { motion } from "framer-motion";

const Samples = ({ visible }) => (
    <div id="samples" style={{ display: visible ? "block" : "none" }}>
        <div
            id="samples-container"
        >
            <Composers />
            <ComposerPieces />
        </div>


    </div>
);

export default function Panel({ setPanelState, setCanvasWidth }) {


    const { setPianoHeight, setScrollSpeed, isPlaying } = usePiano()

    const [layer, setLayer] = useState("pro");
    let layers = {

        "samples": <Samples />,
        "pro": <Pro />,
        "settings": <Settings />,

    }
    const layerNames = {
        samples: "🎶",
        pro: "🧑‍💻",
        settings: "⚙️",
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
                        <button key={key} onClick={() => setLayer(key)}
                            id={`${layer === key ? "selected-layer" : ""}`}
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
            </div>

            <div id="current-layer">
                <Samples visible={layer === "samples"} />
                <Pro visible={layer === "pro"} setLayer={setLayer} />
                <Settings visible={layer === "settings"} />


            </div>


            <div id="controls">

                <div>
                    <button onClick={() => setPianoHeight(h => h + 5)}>+</button>🎹
                    <button onClick={() => setPianoHeight(h => Math.max(5, h - 5))}>-</button>
                </div>

                <div
                    onClick={() => {
                        setPanelState(false)
                        setCanvasWidth(window.innerWidth)

                    }}
                >

                    <img
                        className={isPlaying ? 'playing' : ''}

                        id="close-panel"
                        src="logo.png"
                        style={{
                            objectFit: "contain",
                            transformOrigin: "center center",
                        }}
                    />

                </div>
                <div>
                    <button onClick={() => setScrollSpeed(s => s + 5)}>+</button>↕️
                    <button onClick={() => setScrollSpeed(s => Math.max(5, s - 5))}>-</button>
                </div>

            </div>




        </motion.div>)

}