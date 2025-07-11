import { useEffect, useRef, useState } from "react";
import { usePiano } from "../PianoContext";
import * as Tone from "tone"; // ✅ Needed for Midi conversion and playback
import "./Notes.css";

// 🎹 Load Sampler
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

await Tone.loaded(); // ✅ Ensure the samples are ready before interaction

export default function RecordingNotes({ width }) {
    const { scrollSpeed, recordingNotes, recordingTime, setRecordingTime } = usePiano();

    const scrollRef = useRef(null);

    const notes = recordingNotes?.notes || [];
    const maxTime = notes.length
        ? Math.max(...notes.map((n) => n.time + n.duration))
        : 0;

    const scrollableHeight = maxTime * scrollSpeed;
    const whiteKeyCount = 52;
    const whiteKeyWidth = width / whiteKeyCount;

    const isBlack = (midi) => [1, 3, 6, 8, 10].includes(midi % 12);
    const getWhiteIndex = (midi) => {
        let index = 0;
        for (let i = 21; i < midi; i++) {
            if (!isBlack(i)) index++;
        }
        return index;
    };

    const noteColor = (isB, track) =>
        track === 1
            ? isB ? "#1565C0" : "#42A5F5"
            : isB ? "#2E7D32" : "#66BB6A";


    useEffect(() => {
        const y = recordingTime * scrollSpeed;
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollableHeight - y + 100;
        }
    }, [recordingTime, scrollableHeight]);




    const playFrom = async (startTimeOffset) => {
        await Tone.start();
        const start = Tone.now();
        const baseTime = startTimeOffset;

        // Ticking loop to sync scroll
        const tick = () => {
            const rel = Tone.now() - start + baseTime;
            setRecordingTime(rel);

            if (rel < maxTime + 1) {
                requestAnimationFrame(tick);
            } else {
                setRecordingTime(0);
            }
        };
        tick();

        // Schedule notes from this point onward
        for (const note of notes) {
            const noteEnd = note.time + note.duration;
            if (noteEnd < startTimeOffset) continue;

            const delay = note.time - startTimeOffset;
            const dur = note.duration;
            const name = Tone.Midi(note.midi).toNote();

            Tone.getContext().setTimeout(() => {
                sampler.triggerAttackRelease(name, dur);
            }, delay);
        }
    };


    return (
        <div
            id="piano-notes"
            ref={scrollRef}
            style={{
                height: scrollableHeight + 100,
                position: "relative",
                overflow: "auto",
            }}
        >
            {notes.map((note, i) => {
                const isB = isBlack(note.midi);
                const height = note.duration * scrollSpeed;
                const y = scrollableHeight - (note.time + note.duration) * scrollSpeed;

                const whiteIndex = getWhiteIndex(note.midi);
                const left = isB
                    ? whiteIndex * whiteKeyWidth - whiteKeyWidth * 0.3
                    : whiteIndex * whiteKeyWidth;
                const noteWidth = isB ? whiteKeyWidth * 0.6 : whiteKeyWidth;

                const isActive =
                    recordingTime >= note.time &&
                    recordingTime <= note.time + note.duration;

                const color = noteColor(isB, note?.track);

                return (
                    <div
                        key={i}
                        onClick={(e) => {
                            e.stopPropagation();
                            playFrom(note.time);

                        }}
                        className="piano-note"
                        style={{
                            position: "absolute",
                            left,
                            top: y,
                            width: noteWidth,
                            height,
                            backgroundColor: isActive ? "white" : color,
                            borderRadius: 10,
                            zIndex: isB ? 2 : 1,
                            transform: isActive
                                ? "scale(1.5) scaleY(-1)"
                                : "scale(1) scaleY(-1)",
                            boxShadow: isActive ? `0 0 10px 2px ${color}` : "",
                            animation: isActive ? "pop 0.3s forwards" : "none",
                            transition: "transform 0.3s, box-shadow 0.3s",
                        }}
                    />
                );
            })}
        </div>
    );
}
