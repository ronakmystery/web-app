
import { usePiano } from "../PianoContext"
import "./Keys.css"

export default function Keys({ width }) {

    const { pianoHeight } = usePiano()


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
                        keys.push(
                            <div
                                className="white-key"
                                key={`white-${midi}`}
                                style={{
                                    position: "absolute",
                                    left,
                                    width: whiteKeyWidth,
                                    height: "100%",
                                    backgroundColor: "white",
                                    border: "1px solid #ccc",
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
                        keys.push(
                            <div
                                className="black-key"
                                key={`black-${midi}`}
                                style={{
                                    position: "absolute",
                                    left,
                                    width: whiteKeyWidth * 0.6,
                                    height: pianoHeight * 0.5,
                                    backgroundColor: "black",
                                    borderBottomLeftRadius: 4,
                                    borderBottomRightRadius: 4,
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
