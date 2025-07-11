import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { usePiano } from "../../PianoContext";

// 🎹 Tone Sampler
const sampler = new Tone.Sampler({
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

const example = {
    notes: [
        { midi: 60, time: 0.0, duration: 0.8, track: 0 },
        { midi: 64, time: 0.5, duration: 0.6, track: 0 },
        { midi: 67, time: 1.0, duration: 0.9, track: 0 },
        { midi: 72, time: 2.0, duration: 1.0, track: 0 }
    ],
    pedal: [
        { time: 0.0, down: true },
        { time: 1.8, down: false },
        { time: 2.2, down: true },
        { time: 3.2, down: false }
    ]
};

export default function Record() {

    const { recordingNotes, setRecordingNotes, audioRef, setRecordingTime, setIsPlaying } = usePiano();

    const [recording, setRecording] = useState(false);
    const midiAccessRef = useRef(null);
    const activeNotesRef = useRef(new Map());
    const recordedNotesRef = useRef([]);
    const recordedPedalRef = useRef([]);
    const recordingStartRef = useRef(0);

    useEffect(() => {

        audioRef.current.pause();
        setIsPlaying(false);

        Tone.loaded().then(() => console.log("🎹 Sampler loaded"));

        navigator.requestMIDIAccess?.().then(
            (midiAccess) => {
                midiAccessRef.current = midiAccess;
            },
            () => console.warn("⚠️ MIDI Access Denied.")
        );

        // preload example demo
        setRecordingNotes(example);

    }, []);

    const startRecording = async () => {
        if (!midiAccessRef.current) return;

        await Tone.start();
        recordedNotesRef.current = [];
        recordedPedalRef.current = [];
        activeNotesRef.current = new Map();
        recordingStartRef.current = performance.now() / 1000;
        setRecording(true);

        // Assign input listeners
        for (const input of midiAccessRef.current.inputs.values()) {
            input.onmidimessage = handleMIDIMessage;
        }

        // Auto stop after 7s
        setTimeout(stopRecording, 7000);
    };

    const stopRecording = () => {
        setRecording(false);

        // Remove MIDI listeners
        for (const input of midiAccessRef.current.inputs.values()) {
            input.onmidimessage = null;
        }

        const notes = recordedNotesRef.current;
        const pedal = recordedPedalRef.current;
        setRecordingNotes({ notes, pedal });

        console.log("🛑 Recording stopped. Notes:", notes.length);
    };

    const handleMIDIMessage = ({ data }) => {
        const [status, data1, data2] = data;
        const now = performance.now() / 1000;
        const relTime = now - recordingStartRef.current;

        // Sustain pedal
        if (status >= 176 && status < 192 && data1 === 64) {
            const isDown = data2 >= 64;
            recordedPedalRef.current.push({ time: relTime, down: isDown });
            return;
        }

        // Note on
        if (status === 144 && data2 > 0) {
            activeNotesRef.current.set(data1, relTime);
        }

        // Note off
        if ((status === 128 || (status === 144 && data2 === 0)) && activeNotesRef.current.has(data1)) {
            const start = activeNotesRef.current.get(data1);
            const duration = relTime - start;
            recordedNotesRef.current.push({
                midi: data1,
                time: start,
                duration,
                track: 0
            });
            activeNotesRef.current.delete(data1);
        }
    };

    const playback = ({ notes, pedal }) => {

        const maxTime = Math.max(...notes.map(n => n.time + n.duration));

        const startTime = Tone.now();
        let pedalEvents = [...pedal];
        let sustain = false;

        const tick = () => {
            const rel = Tone.now() - startTime;
            setRecordingTime(rel); // <- updates context value

            if (rel < maxTime + 1) {
                requestAnimationFrame(tick);
            }
        };

        tick();

        notes.forEach((note) => {
            const noteEnd = note.time + note.duration;

            while (pedalEvents.length && pedalEvents[0].time <= noteEnd) {
                sustain = pedalEvents[0].down;
                pedalEvents.shift();
            }

            const dur = sustain ? note.duration + 1 : note.duration;
            const noteName = Tone.Midi(note.midi).toNote();
            Tone.getContext().setTimeout(() => {
                sampler.triggerAttackRelease(noteName, dur);
            }, note.time);
        });
    };


    return (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button onClick={startRecording} disabled={recording}>
                {recording ? "🎙️ Recording..." : "▶️ Start 7s MIDI Recording"}
            </button>
            <br /><br />
            <button onClick={() => recordingNotes && playback(recordingNotes)} disabled={!recordingNotes}>
                🔁 Replay Last Recording
            </button>
        </div>
    );
}
