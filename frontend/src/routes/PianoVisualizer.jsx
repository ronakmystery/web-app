import { useEffect, useState } from "react";
import PianoKeys from "./components/PianoKeys";
import Notes from "./components/Notes";
import PianoControls from "./components/PianoControls";
import Highlight from "./components/Highlight";

export default function PianoVisualizer() {
    const [notes, setNotes] = useState([]);
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
    const [pianoHeight, setPianoHeight] = useState(60);
    const [scrollSpeed, setScrollSpeed] = useState(40);
    const [highlightHeight, setHighlightHeight] = useState(230);

    useEffect(() => {
        const savedHeight = localStorage.getItem("pianoHeight");
        const savedScrollSpeed = localStorage.getItem("scrollSpeed");
        const savedHighlightHeight = localStorage.getItem("highlightHeight");

        if (savedHeight) setPianoHeight(parseInt(savedHeight));
        if (savedScrollSpeed) setScrollSpeed(parseInt(savedScrollSpeed));
        if (savedHighlightHeight) setHighlightHeight(parseInt(savedHighlightHeight));
    }, []);

    // Save to localStorage
    let usePersistSetting = (key, value) => {
        useEffect(() => {
            if (value !== undefined) {
                localStorage.setItem(key, value);
            }
        }, [key, value]);
    }
    usePersistSetting("scrollSpeed", scrollSpeed);
    usePersistSetting("pianoHeight", pianoHeight);
    usePersistSetting("highlightHeight", highlightHeight);

    useEffect(() => {
        const update = () => setCanvasWidth(window.innerWidth);
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);



    return (
        <div id="piano-app">
            <Highlight keyHeight={pianoHeight} height={highlightHeight} />
            <PianoKeys width={canvasWidth} height={pianoHeight} />
            <Notes notes={notes} width={canvasWidth} scrollSpeed={scrollSpeed} />

            <PianoControls
                pianoHeight={pianoHeight}
                setPianoHeight={setPianoHeight}
                scrollSpeed={scrollSpeed}
                setScrollSpeed={setScrollSpeed}
                setNotes={setNotes}
                setHighlightHeight={setHighlightHeight}
            />


        </div>
    );
}
