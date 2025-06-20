import { useEffect, useState } from "react";

export default function Notes({ notes, width, scrollSpeed, setCurrentTime, audioRef,pianoHeight }) {
    const [currentTime, setCurrentTimeInternal] = useState(0);

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

    useEffect(() => {
        if (notes.length) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" });
        }
    }, [notes]);

    useEffect(() => {
        if (window.innerWidth < 400) return;

        const saveScroll = () => {
            localStorage.setItem("pianoScrollY", window.scrollY.toString());
        };

        window.addEventListener("scroll", saveScroll);
        return () => window.removeEventListener("scroll", saveScroll);
    }, []);

    useEffect(() => {
        if (notes.length) {
            const saved = localStorage.getItem("pianoScrollY");
            const y = saved ? parseInt(saved) : document.body.scrollHeight;
            window.scrollTo({ top: y, behavior: "auto" });
        }
    }, [notes]);

    // Sync currentTime from audioRef using requestAnimationFrame
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

    function noteColor(isB, track) {
        return track === 1
            ? isB ? "#1565C0" : "#42A5F5"
            : isB ? "#2E7D32" : "#66BB6A";
    }
    
    useEffect(() => {
        const y = currentTime * scrollSpeed;
        window.scrollTo({ top: scrollableHeight-window.innerHeight+pianoHeight+200-y, });
    }, [currentTime, scrollSpeed]);



    return (
        <div
            id="piano-notes"
            style={{
                height: scrollableHeight
            }}
            onClick={(event) => {
                const container = event.currentTarget;
                const boundingRect = container.getBoundingClientRect();
                const relativeY = event.clientY - boundingRect.top;

                let position = relativeY;
                let duration = audioRef.current.duration;
                let scaler = scrollableHeight / duration;
                let time = position / scaler;
                let newTime = duration - time;

                setCurrentTime(newTime);
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
                        onClick={() => console.log(note)}
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
                            transform: isActive ? "scale(1.5) scaleY(-1)" : "scale(1) scaleY(-1)",
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            boxShadow: isActive ? `0 0 10px 2px ${color}` : "none",
                            animation: isActive ? "pop 0.3s forwards" : "none",

                        }}
                    />
                );
            })}
        </div>
    );
}
