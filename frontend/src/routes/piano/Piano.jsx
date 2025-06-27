import { useEffect, useState, useRef, useContext } from "react";
import "./Piano.css"

import { usePiano } from "./PianoContext"

import Panel from "./components/Panel";
import Keys from "./components/Keys";
import Notes from "./components/Notes"


export default function Piano() {


    const { audioRef, selectedMidiPath, isPlaying, setIsPlaying } = usePiano()


    const [canvasWidth, setCanvasWidth] = useState(0);
    const [panelState, setPanelState] = useState(false)


    useEffect(() => {
        const update = () => {
            const isPortrait = window.innerHeight > window.innerWidth;
            console.log(panelState)

            const width = isPortrait
                ? window.innerWidth
                : panelState
                    ? window.innerWidth - 400
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
                            setCanvasWidth(window.innerWidth - 400)
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
                onClick={() => {
                    const audio = audioRef.current;

                    if (!audio.paused) {
                        audio.pause();
                        setIsPlaying(false)
                    } else {
                        audio.play()
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
