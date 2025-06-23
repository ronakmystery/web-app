import { createContext, useContext, useEffect, useState, useRef } from 'react';

import { Midi } from "@tonejs/midi";

const PianoContext = createContext();


const STORAGE_KEY = "PIANO";

export function PianoProvider({ children }) {
    const [notes, setNotes] = useState([]);

    const [pianoHeight, setPianoHeight] = useState(60);
    const [scrollSpeed, setScrollSpeed] = useState(40);

    useEffect(() => {
        fetch("/midis.json")
            .then((res) => res.json())
            .then((data) => {

                setCollection(data)
            }
            )
            .catch((err) => console.error("Failed to load MIDI list", err));

        const saved = localStorage.getItem("selectedMidiPath");
        loadMidi(saved || "/midis/chopin/N1.mid");
    }, []);


    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        try {
            const { pianoHeight, scrollSpeed } = JSON.parse(raw);
            if (pianoHeight !== undefined) setPianoHeight(pianoHeight);
            if (scrollSpeed !== undefined) setScrollSpeed(scrollSpeed);
        } catch {
            console.warn("⚠️ Invalid localStorage settings");
        }
    }, []);

    useEffect(() => {
        const settings = { pianoHeight, scrollSpeed };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [pianoHeight, scrollSpeed]);


    const audioRef = useRef(null);
    const [currentTime, setCurrentTimeInternal] = useState(0)
    useEffect(() => {
        let frameId;

        const update = () => {
            if (audioRef.current) {
                setCurrentTimeInternal(audioRef.current.currentTime);
            }
            frameId = requestAnimationFrame(update);
        };

        frameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frameId);
    }, [audioRef]);
    const setCurrentTime = (time) => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            audio.currentTime = time;  // ⏱️ Seek to new time
            audio.play(); // ▶️ Start playback if paused
        } else {
            audio.pause(); // ⏹️ Stop playback if already playing
        }
    };


    const [collection, setCollection] = useState(null);
    const [selectedComposer, setSelectedComposer] = useState("chopin");
    const [selectedMidiPath, setSelectedMidiPath] = useState("/midis/chopin/N1.mid");
    const parseMidi = (midi) => {


        const allNotes = [];
        midi.tracks.forEach((track, trackIndex) => {
            track.notes.forEach((note) => {
                allNotes.push({
                    midi: note.midi,
                    time: note.time,
                    duration: note.duration,
                    track: trackIndex,
                });
            });
        });

        setNotes(allNotes);

    };
    const loadMidi = async (path) => {
        const res = await fetch(path);
        const buffer = await res.arrayBuffer();
        const midi = new Midi(buffer);
        parseMidi(midi);
        setSelectedMidiPath(path);
        localStorage.setItem("selectedMidiPath", path);
    };



    return (
        <PianoContext.Provider value={{
            notes, setNotes,
            pianoHeight, setPianoHeight,
            scrollSpeed, setScrollSpeed,
            audioRef, currentTime, setCurrentTimeInternal, setCurrentTime,
            selectedMidiPath, parseMidi, loadMidi,
            collection, selectedComposer, setSelectedComposer
        }}>
            {children}
        </PianoContext.Provider>
    );
};


export function usePiano() {
    return useContext(PianoContext)
}