import { useEffect, useRef, useState } from "react";
import { usePiano } from "../PianoContext";
import * as Tone from "tone"; // ✅ Needed for Midi conversion and playback
import "./Notes.css";

export default function RecordingNotes({ width }) {
    const { scrollSpeed, recordingNotes, recordingTime, isPlaying, setIsPlaying, playback, pianoHeight, offset } = usePiano();

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
        isB ? "#2E7D32" : "#66BB6A";





    //autoscroll 
    useEffect(() => {
        const y = recordingTime * scrollSpeed;

        window.scrollTo({
            top: scrollableHeight - y + pianoHeight + offset, behavior: "auto"
        });

    }, [recordingTime, scrollSpeed]);




    useEffect(() => {
        if (notes.length) {
            const y = document.body.scrollHeight;
            window.scrollTo({ top: y, behavior: "auto" });
        }
    }, [notes]);


    return (
        <div
            id="piano-notes"
            ref={scrollRef}
            style={{
                height: scrollableHeight + pianoHeight,
                width

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
                            if (!recordingNotes) return;
                            playback(recordingNotes, note.time);
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
                            transform: isActive ? "scale(1.3)" : "scale(1)",

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
