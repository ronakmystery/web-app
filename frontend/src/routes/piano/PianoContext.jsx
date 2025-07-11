import { createContext, useContext, useEffect, useState, useRef } from 'react';

import { Midi } from "@tonejs/midi";

const PianoContext = createContext();


const STORAGE_KEY = "PIANO";

export function PianoProvider({ children }) {
    const [notes, setNotes] = useState([]);

    const [pianoHeight, setPianoHeight] = useState(60);
    const [scrollSpeed, setScrollSpeed] = useState(40);

    //load collection
    useEffect(() => {
        fetch(`/midis.json?cb=${Date.now()}`)
            .then((res) => res.json())
            .then((data) => setCollection(data))
            .catch((err) => console.error("Failed to load MIDI list", err));
    }, []);





    const audioRef = useRef(null);
    const [currentTime, setCurrentTimeInternal] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false);
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



    const [collection, setCollection] = useState(null);
    const [selectedComposer, setSelectedComposer] = useState("chopin");
    const [selectedMidiPath, setSelectedMidiPath] = useState(null);
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
        setSelectedMidiPath(path);
        parseMidi(midi);
        setIsPlaying(false);
    };


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
        const settings = {
            pianoHeight,
            scrollSpeed,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [pianoHeight, scrollSpeed, selectedMidiPath, selectedComposer]);

    const [userid, setUserid] = useState("");
    const [email, setEmail] = useState("");

    const [files, setFiles] = useState([]);

    const [selectedFile, setSelectedFile] = useState(null);

    const [layer, setLayer] = useState("record");


    const [recordingNotes, setRecordingNotes] = useState(null);
    let playpause = (time) => {
        const audio = audioRef.current;
        audio.currentTime = time
        if (audio.paused) {
            audio.play();
            setIsPlaying(true)
        } else {
            audio.pause();
            setIsPlaying(false)
        }
    }

    const [recordingTime, setRecordingTime] = useState(0);


    return (
        <PianoContext.Provider value={{
            notes, setNotes,
            pianoHeight, setPianoHeight,
            scrollSpeed, setScrollSpeed,
            audioRef, currentTime, setCurrentTimeInternal,
            selectedMidiPath, setSelectedMidiPath, parseMidi, loadMidi,
            collection, selectedComposer, setSelectedComposer,
            isPlaying, setIsPlaying,
            userid, setUserid,
            email, setEmail,
            files, setFiles,
            selectedFile, setSelectedFile,
            layer, setLayer,

            recordingNotes, setRecordingNotes,

            playpause,

            recordingTime, setRecordingTime,
        }}>
            {children}
        </PianoContext.Provider>
    );
};


export function usePiano() {
    return useContext(PianoContext)
}