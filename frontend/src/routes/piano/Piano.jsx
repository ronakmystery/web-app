import { useEffect, useState, useRef, useContext } from "react";
import "./Piano.css"

import { usePiano } from "./PianoContext"

import Panel from "./components/Panel";
import Keys from "./components/Keys";
import Notes from "./components/Notes"
import { AnimatePresence, motion } from "framer-motion";


export default function Piano() {


    const { audioRef, selectedMidiPath, isPlaying, setIsPlaying } = usePiano()


    const [canvasWidth, setCanvasWidth] = useState(0);

    useEffect(() => {
        let portraitLimit = 400
        const update = () => {
            let width = window.innerWidth < portraitLimit
                ? window.innerWidth
                : window.innerWidth * 1;
            setCanvasWidth(width);
        };

        window.addEventListener("resize", update);
        update();
        return () => window.removeEventListener("resize", update);
    }, []);

    const [panelState, setPanelState] = useState(true)




    return (

        <div id="piano-app"


        >
            {panelState ? (
                <Panel setPanelState={setPanelState} key="panel" />
            ) : (
                <motion.div
                    id="show-panel"
                    onClick={() => setPanelState(true)}
                    style={{
                        display: "inline-block",
                    }}
                    className={isPlaying ? 'playing' : ''}

                >

                    <img

                        src="logo.png"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            transformOrigin: "center center",
                        }}
                    />
                </motion.div>
            )}

            <div id="piano-canvas"

                onClick={() => {
                    const audio = audioRef.current;

                    if (!audio.paused) {
                        audio.pause();
                        setIsPlaying(false)
                    } else {
                        audio.play()
                        setPanelState(false)
                        setIsPlaying(true)
                    }


                }}
            >
                <Keys width={canvasWidth} />
                <Notes width={canvasWidth} />
            </div>

            <div id="piano-background"></div>



            <audio
                style={{ display: "none" }}
                ref={audioRef}
                src={selectedMidiPath.replace("/midis/", "/mp3s/").replace(/\.mid$/, ".mp3")} controls />


        </div>

    );
}
