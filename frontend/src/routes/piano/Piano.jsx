import { useEffect, useState, useRef, useContext } from "react";
import "./Piano.css"

import { usePiano } from "./PianoContext"

import Panel from "./components/Panel";
import Keys from "./components/Keys";
import Notes from "./components/Notes"
import RecordingNotes from "./components/RecordingNotes";
import RecordingKeys from "./components/RecordingKeys";


export default function Piano() {


    const { audioRef, selectedMidiPath, isPlaying, layer } = usePiano()


    const [canvasWidth, setCanvasWidth] = useState(0);
    const [panelState, setPanelState] = useState(true)


    useEffect(() => {
        const update = () => {
            const isPortrait = window.innerHeight > window.innerWidth;

            const width = isPortrait
                ? window.innerWidth
                : panelState
                    ? window.innerWidth - 300
                    : window.innerWidth;

            setCanvasWidth(width);
        };

        window.addEventListener("resize", update);
        update();
        return () => window.removeEventListener("resize", update);
    }, [panelState]);



    useEffect(() => {
        if (isPlaying) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [isPlaying]);





    return (

        <div id="piano-app"


        >
            {panelState ? (
                <Panel setPanelState={setPanelState}
                    setCanvasWidth={setCanvasWidth}
                    key="panel" />
            ) : (
                <div
                    id="show-panel"
                    onClick={() => {
                        setPanelState(true)

                        if (window.innerWidth > window.innerHeight) {
                            setCanvasWidth(window.innerWidth - 300)
                        }

                    }}
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
                </div>
            )}

            <div id="piano-canvas"

            >
                {
                    layer == "record" ? <RecordingKeys width={canvasWidth} /> :
                        <Keys width={canvasWidth} />
                }

                {
                    layer == "record" ? <RecordingNotes width={canvasWidth} /> :
                        <Notes width={canvasWidth} />
                }

            </div>




            <audio
                style={{ display: "none" }}
                ref={audioRef}
                src={selectedMidiPath?.replace("/midis/", "/mp3s/").replace(/\.mid$/, ".mp3")} controls />


        </div>

    );
}
