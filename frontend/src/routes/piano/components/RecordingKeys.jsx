
import { usePiano } from "../PianoContext"
import "./Keys.css"

export default function RecordingKeys({ width }) {

    const { pianoHeight, recordingNotes, recordingTime } = usePiano()


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


    const activeMidiNotes = recordingNotes?.notes
        .filter(n => recordingTime >= n.time && recordingTime <= n.time + n.duration)
        .map(n => n.midi);

    return (
        <div
            id="piano-keys"
            style={{ height: pianoHeight, width }}
        >
            {/* White Keys */}
            {(() => {
                const keys = [];
                for (let midi = 21; midi <= 108; midi++) {
                    if (!isBlack(midi)) {
                        const left = getWhiteIndex(midi) * whiteKeyWidth;

                        const isActive = activeMidiNotes?.includes(midi);

                        keys.push(
                            <div
                                className={`piano-key white-key  ${isActive ? "pressed" : ""}`}

                                key={`white-${midi}`}
                                style={{
                                    position: "absolute",
                                    left,
                                    width: whiteKeyWidth,
                                    height: "100%",
                                    border: ".11px solid #ccc",
                                    borderTop: "none",
                                    boxSizing: "border-box",
                                    zIndex: 1,
                                }}
                            />
                        );
                    }
                }
                return keys;
            })()}

            {/* Black Keys */}
            {(() => {
                const keys = [];
                let whiteIndex = 0;
                for (let midi = 21; midi <= 108; midi++) {
                    if (isBlack(midi)) {
                        const left = whiteIndex * whiteKeyWidth - whiteKeyWidth * 0.3;
                        const isActive = activeMidiNotes?.includes(midi);

                        keys.push(
                            <div
                                className={`piano-key black-key ${isActive ? "pressed" : ""}`}
                                key={`black-${midi}`}
                                style={{
                                    position: "absolute",
                                    left,
                                    width: whiteKeyWidth * 0.6,
                                    height: pianoHeight * 0.5,
                                    zIndex: 2,
                                }}
                            />
                        );
                    } else {
                        whiteIndex++;
                    }
                }
                return keys;
            })()}
        </div>
    );
}
