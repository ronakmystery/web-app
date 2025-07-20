import { useState, useEffect } from "react";
import { usePiano } from "../PianoContext"

import Composers from "./panel/Composers";
import ComposerPieces from "./panel/ComposerPieces";
import Pro from "./panel/Pro"
import Record from "./panel/Record";
import Community from "./panel/Community/Community";

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


    const { setPianoHeight, setScrollSpeed, isPlaying, setNotes, audioRef, setSelectedMidiPath, layer, setLayer, recording, userid, isPlayingRecording, setShowSettings, showSettings, isPortrait, setIsPortrait } = usePiano()

    const layers = {
        "samples": <Samples />,
        "pro": <Pro />,
        "record": <Record />,
        "community": <Community />,
    };




    const layerNames = {
        "samples": "🎶",
        "pro": "⭐",
        "record": "🎤",
        "community": "🌍",
    };






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


            </div>



            <div id="current-layer">
                {layers[layer]}
            </div>






            <div id="right-side-panel">

                <img
                    onClick={() => {
                        setPanelState(false);
                    }}
                    id="logo"
                    className={`${isPlaying || isPlayingRecording ? 'playing-glow' : ''} ${recording ? 'recording-glow' : ''}`}

                    src="logo.png"
                    style={{
                        objectFit: "contain",
                        transformOrigin: "center center",
                    }}
                />
                <button id="settings-button" onClick={() => { setShowSettings(!showSettings) }}>
                    ⚙️
                </button>


            </div>



        </motion.div>)

}