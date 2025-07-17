import { createContext, useContext, useEffect, useState, useRef, use } from 'react';

import { Midi } from "@tonejs/midi";

const PianoContext = createContext();


const STORAGE_KEY = "PIANO";


import * as Tone from "tone"; // ✅ Needed for Midi conversion and playback
// 🎹 Load Sampler
const pianoSounds = new Tone.Sampler({
    urls: {
        "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
        "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
        "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
        "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
        "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
        "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
        "A6": "A6.mp3", "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
        "A7": "A7.mp3", "C8": "C8.mp3"
    },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

await Tone.loaded(); // ✅ Ensure the samples are ready before interaction




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

    const [layer, setLayer] = useState("pro");


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



    const partRef = useRef(null);
    const rafRef = useRef(null); // Track animation frame
    const playback = async ({ notes, pedal }, startOffset = 0) => {
        cancelAnimationFrame(rafRef.current); // cancel any old end check

        await Tone.start();
        Tone.getTransport().stop();
        Tone.getTransport().cancel();

        // Filter and shift events based on startOffset
        const events = notes
            .filter(note => note.time + note.duration >= startOffset)
            .map(note => ({
                time: note.time - startOffset,
                note: Tone.Midi(note.midi).toNote(),
                duration: note.duration,
                velocity: note.velocity || 0.8
            }));

        let sustain = false;
        const heldByPedal = new Map();
        const currentlyHeldKeys = new Set();

        // Filter and shift pedal events
        pedal
            .filter(event => event.time >= startOffset)
            .forEach(event => {
                Tone.getTransport().schedule(() => {
                    sustain = event.down;
                    if (!event.down) {
                        for (const [note] of heldByPedal) {
                            if (!currentlyHeldKeys.has(note)) {
                                pianoSounds.triggerRelease(note, Tone.now());
                            }
                        }
                        heldByPedal.clear();
                    }
                }, event.time - startOffset);
            });

        partRef.current = new Tone.Part((time, value) => {
            const note = value.note;
            currentlyHeldKeys.add(note);
            pianoSounds.triggerAttack(note, time, value.velocity);

            Tone.getTransport().schedule((releaseTime) => {
                currentlyHeldKeys.delete(note);
                if (!sustain) {
                    pianoSounds.triggerRelease(note, releaseTime);
                } else {
                    heldByPedal.set(note, releaseTime);
                }
            }, value.time + value.duration);
        }, events).start(0);

        Tone.getTransport().bpm.value = 120;

        const checkEnd = () => {
            const noteEnd = notes.length ? Math.max(...notes.map(n => n.time + n.duration)) : 0;
            const pedalEnd = pedal.length ? Math.max(...pedal.map(p => p.time + (p.duration || 0))) : 0;
            const maxTime = Math.max(noteEnd, pedalEnd) - startOffset;

            const rel = Tone.getTransport().seconds;
            setRecordingTime(rel + startOffset);

            if (rel < maxTime + 2) {
                rafRef.current = requestAnimationFrame(checkEnd);
            } else {
                for (const [note] of heldByPedal) {
                    if (!currentlyHeldKeys.has(note)) {
                        pianoSounds.triggerRelease(note, Tone.now());
                    }
                }
                heldByPedal.clear();
                currentlyHeldKeys.clear();

                setIsPlaying(false);
                setRecordingTime(0);
                partRef.current?.dispose();
                partRef.current = null;
                Tone.getTransport().stop();
                Tone.getTransport().cancel();
            }
        };

        Tone.getTransport().start();
        setIsPlaying(true);
        checkEnd();
    };

    const resetPlayback = () => {
        // Stop transport and cancel scheduled events
        Tone.getTransport().stop();
        Tone.getTransport().cancel();

        // Cancel animation frame loop (checkEnd)
        cancelAnimationFrame(rafRef.current);

        // Dispose existing part
        partRef.current?.dispose();
        partRef.current = null;

        // Reset UI state
        setIsPlaying(false);
        setRecordingTime(0);

    };

    useEffect(() => {
        resetPlayback();
    }, [recordingNotes]);

    const [recordings, setRecordings] = useState([]);
    const [selectedRecording, setSelectedRecording] = useState(null);

    const fetchRecordings = async () => {
        const res = await fetch(`/backend/recordings/${userid}`);
        const data = await res.json();
        setRecordings(data);
    };

    const [recording, setRecording] = useState(false);


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

            pianoSounds,

            playback,
            partRef, rafRef,
            resetPlayback,
            recordings, setRecordings, fetchRecordings,
            selectedRecording, setSelectedRecording,

            recording, setRecording,
        }}>
            {children}
        </PianoContext.Provider>
    );
};


export function usePiano() {
    return useContext(PianoContext)
}