
import { useEffect, useState } from "react";
import { usePiano } from "../PianoContext"
import "./Notes.css"

export default function Notes({ width }) {

    const { notes, scrollSpeed, audioRef, setIsPlaying, currentTime, playpause, pianoHeight } = usePiano()


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

    const maxTime = notes.length > 0
        ? Math.max(...notes.map(n => n.time + n.duration))
        : 0;

    const scrollableHeight = maxTime * scrollSpeed;

    function noteColor(isB, track) {
        return track === 1
            ? isB ? "#1565C0" : "#42A5F5"
            : isB ? "#2E7D32" : "#66BB6A";
    }

    //scroll to bottom or saved scroll position
    useEffect(() => {
        if (notes.length) {
            const y = document.body.scrollHeight;
            window.scrollTo({ top: y, behavior: "auto" });
        }
    }, [notes]);

    //autoscroll 
    useEffect(() => {
        const y = currentTime * scrollSpeed;

        window.scrollTo({
            top: scrollableHeight - y + pianoHeight, behavior: "auto"
        });



    }, [currentTime, scrollSpeed]);


    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            setIsPlaying(false);
            const y = document.body.scrollHeight;
            window.scrollTo({ top: y, behavior: "auto" });
        };

        // Optional safety for partial listens
        const checkEnded = () => {
            if (audio.currentTime >= audio.duration - 0.1) {
                handleEnded();
            }
        };

        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("timeupdate", checkEnded); // in case .ended doesn't fire reliably

        return () => {
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("timeupdate", checkEnded);
        };
    }, [audioRef, setIsPlaying]);






    return (
        <div
            id="piano-notes"

            style={{
                height: scrollableHeight + pianoHeight, width
            }}



        >

            {notes.map((note, i) => {
                const isB = isBlack(note.midi);
                const h = note.duration * scrollSpeed;
                const y = scrollableHeight - (note.time + note.duration) * scrollSpeed;

                const whiteIndex = getWhiteIndex(note.midi);
                const left = isB
                    ? whiteIndex * whiteKeyWidth - whiteKeyWidth * 0.3
                    : whiteIndex * whiteKeyWidth;
                const noteWidth = isB ? whiteKeyWidth * 0.6 : whiteKeyWidth;

                const isActive = currentTime >= note.time && currentTime <= note.time + note.duration;


                const color = noteColor(isB, note?.track, isActive);


                return (

                    <div
                        key={i}
                        onClick={(e) => {
                            e.stopPropagation()

                            playpause(note.time)

                        }}
                        className="piano-note"
                        style={{

                            position: "absolute",
                            left,
                            top: y,
                            width: noteWidth,
                            height: h,
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
