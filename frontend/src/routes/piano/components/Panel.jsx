import { useState } from "react";
import { usePiano } from "../PianoContext"

import Composers from "./panel/Composers";
import ComposerPieces from "./panel/ComposerPieces";
import Pro from "./panel/Pro"

import "./Panel.css"

import { motion } from "framer-motion";

const DefaultLayer = () => (
    <>
        <Composers />
        <ComposerPieces />
    </>
);

export default function Panel({ setPanelState }) {


    const { setPianoHeight, setScrollSpeed } = usePiano()

    const [layer, setLayer] = useState("samples");
    let layers = {
        "samples": <DefaultLayer />,
        "pro": <Pro />,
    }


    return (
        <motion.div
            id="panel"
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ duration: 0.3 }}
        >

            <div id="controls">

                <div>
                    <button onClick={() => setPianoHeight(h => h + 5)}>+</button>🎹
                    <button onClick={() => setPianoHeight(h => Math.max(5, h - 5))}>-</button>
                </div>

                <div
                    onClick={() => setPanelState(false)}
                >👍</div>
                <div>
                    <button onClick={() => setScrollSpeed(s => s + 5)}>+</button>🎵
                    <button onClick={() => setScrollSpeed(s => Math.max(5, s - 5))}>-</button>
                </div>

            </div>

            <div id="select-layer">
                {
                    Object.keys(layers).map((key) => (
                        <button key={key} onClick={() => setLayer(key)}
                            id={`${layer === key ? "selected-layer" : ""}`}
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                    ))
                }
            </div>

            <div id="current-layer">

                {
                    layers[layer]
                }
            </div>







        </motion.div>)

}