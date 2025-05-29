import { useEffect, useState } from "react";
import PianoKeys from "./components/PianoKeys";
import Notes from "./components/Notes";
import PianoControls from "./components/PianoControls";

export default function PianoVisualizer() {
    const [notes, setNotes] = useState([]);
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
    const [pianoHeight, setPianoHeight] = useState(100);
    const [scrollSpeed, setScrollSpeed] = useState(100);

    useEffect(() => {
        const savedHeight = localStorage.getItem("pianoHeight");
        const savedStretch = localStorage.getItem("noteStretch");
        if (savedHeight) setPianoHeight(parseInt(savedHeight));
        if (savedStretch) setNoteStretch(parseInt(savedStretch));
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem("pianoHeight", pianoHeight);
    }, [pianoHeight]);

    useEffect(() => {
        localStorage.setItem("scrollSpeed", scrollSpeed);
    }, [scrollSpeed]);


    useEffect(() => {
        const update = () => setCanvasWidth(window.innerWidth);
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

   

    return (
        <div id="piano-app">
          
            <PianoKeys width={canvasWidth} height={pianoHeight} />
            <Notes notes={notes} width={canvasWidth} scrollSpeed={scrollSpeed} />

            <PianoControls
                pianoHeight={pianoHeight}
                setPianoHeight={setPianoHeight}
                scrollSpeed={scrollSpeed}
                setScrollSpeed={setScrollSpeed}
                setNotes={setNotes}
            />


        </div>
    );
}
