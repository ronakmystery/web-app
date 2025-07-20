import { useEffect, useState, useRef, useContext } from "react";
import "./Piano.css"

import * as Tone from "tone"; // ✅ Needed for Midi conversion and playback


import { usePiano } from "./PianoContext"

import Panel from "./components/Panel";
import Keys from "./components/Keys";
import Notes from "./components/Notes"
import RecordingNotes from "./components/RecordingNotes";
import RecordingKeys from "./components/RecordingKeys";
import Settings from "./components/Settings"


export default function Piano() {


    const { audioRef, selectedMidiPath, isPlaying, layer, setEmail, setUserid, recordingTime, setIsPlaying, playback, recordingNotes, playpause, currentTime, recording, isPlayingRecording, setIsPlayingRecording, showSettings } = usePiano()


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


    //autologin
    useEffect(() => {

        const uuid = localStorage.getItem("uuid");
        const code = localStorage.getItem("code");

        if (!uuid || !code) return;

        fetch("/backend/verify_uuid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uuid, code }),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Verification failed");
                return res.json();
            })
            .then((data) => {
                if (data.email) {
                    setEmail(data.email);
                    setUserid(uuid);
                }
            })

    }, []);





    return (

        <div id="piano-app"


        >

            <div id="background"></div>

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
                    className={`${isPlaying ? 'playing-glow' : ''}
                    ${isPlayingRecording ? 'playing-glow' : ''}
                    ${recording ? 'recording-glow' : ''}`}

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

            {(layer === "record" || layer === "community") ? (
                <div
                    id="piano-canvas"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!recordingNotes) return;

                        if (isPlayingRecording) {
                            Tone.getTransport().pause();
                            setIsPlayingRecording(false);
                        } else {
                            playback(recordingNotes, recordingTime);
                        }
                    }}
                >
                    <RecordingKeys width={canvasWidth} />
                    <RecordingNotes width={canvasWidth} />
                </div>
            ) : (
                <div
                    id="piano-canvas"
                    onClick={() => {
                        playpause(currentTime);
                    }}
                >
                    <Keys width={canvasWidth} />
                    <Notes width={canvasWidth} />
                </div>
            )}



            {showSettings && <Settings />}



            <audio
                style={{ display: "none" }}
                ref={audioRef}
                src={selectedMidiPath?.replace("/midis/", "/mp3s/").replace(/\.mid$/, ".mp3")} controls />


        </div>

    );
}
