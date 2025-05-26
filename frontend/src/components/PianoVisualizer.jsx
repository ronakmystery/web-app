import { useEffect, useState } from "react";
import { Midi } from "@tonejs/midi";
import PianoKeys from "./PianoKeys";
import Notes from "./Notes";

export default function PianoVisualizer() {
    const [notes, setNotes] = useState([]);
    const scrollSpeed = 100;
    const pianoHeight = 100;
    
    
        const divide=1
        const [canvasWidth, setCanvasWidth] = useState(window.innerWidth/divide);
        useEffect(() => {
            const update = () => setCanvasWidth(window.innerWidth/divide);
            window.addEventListener("resize", update);
            return () => window.removeEventListener("resize", update);
        }, []);



    useEffect(() => {
        const load = async () => {
            const res = await fetch("/x.mid");
            const buffer = await res.arrayBuffer();
            const midi = new Midi(buffer);

            const allNotes = [];
            midi.tracks.forEach((track) => {
                track.notes.forEach((note) => {
                    allNotes.push({
                        midi: note.midi,
                        time: note.time,
                        duration: note.duration,
                    });
                });
            });

            setNotes(allNotes);
        };

        load();
    }, []);



    return (
        <div id="piano-app">
            <PianoKeys width={canvasWidth} height={pianoHeight} />
            <Notes notes={notes} width={canvasWidth} scrollSpeed={scrollSpeed} />
        </div>
    );
}
