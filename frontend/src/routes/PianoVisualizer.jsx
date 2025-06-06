import { useEffect, useState } from "react";
import PianoKeys from "./components/PianoKeys";
import Notes from "./components/Notes";
import PianoControls from "./components/PianoControls";
import Highlight from "./components/Highlight";

export default function PianoVisualizer() {

    let initialWidth = window.innerWidth < 400
        ? window.innerWidth
        : window.innerWidth * 0.8;

    const [notes, setNotes] = useState([]);
    const [canvasWidth, setCanvasWidth] = useState(initialWidth);
    const [pianoHeight, setPianoHeight] = useState(60);
    const [scrollSpeed, setScrollSpeed] = useState(40);
    const [highlightHeight, setHighlightHeight] = useState(230);

    
    useEffect(() => {
        const update = () => {
            const width = window.innerWidth < 400
                ? window.innerWidth
                : window.innerWidth * 0.8;
            setCanvasWidth(width);
        };

        window.addEventListener("resize", update);
        update(); // ensure it's correct on first load too
        return () => window.removeEventListener("resize", update);
    }, []);


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




    return (
        <div id="piano-app">



            <PianoControls
                pianoHeight={pianoHeight}
                setPianoHeight={setPianoHeight}
                scrollSpeed={scrollSpeed}
                setScrollSpeed={setScrollSpeed}
                setNotes={setNotes}
                setHighlightHeight={setHighlightHeight}
            />


            <div id="piano-canvas">
                <Highlight keyHeight={pianoHeight} height={highlightHeight} />
                <PianoKeys width={canvasWidth} height={pianoHeight} />
                <Notes notes={notes} width={canvasWidth} scrollSpeed={scrollSpeed} />
            </div>


        </div>
    );
}
