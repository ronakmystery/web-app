import { useEffect, useState, useRef, useContext } from "react";
import "./Piano.css"

import { usePiano } from "./PianoContext"

import Panel from "./components/Panel";
import Keys from "./components/Keys";
import Notes from "./components/Notes"
import { AnimatePresence, motion } from "framer-motion";


export default function Piano() {


    const { audioRef, selectedMidiPath } = usePiano()

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

    const [panelState, setPanelState] = useState(false)
    return (

        <div id="piano-app">
            <AnimatePresence>
                {panelState ? (
                    <Panel setPanelState={setPanelState} key="panel" />
                ) : (
                    <motion.div
                        id="hide-panel"
                        key="show-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setPanelState(true)}
                    >
                        ⚙️
                    </motion.div>
                )}
            </AnimatePresence>

            <div id="piano-canvas">
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
