
import { usePiano } from "../../PianoContext"

export default function ComposerPieces() {


    const { selectedMidiPath, selectedComposer, collection, loadMidi } = usePiano()


    return (
        <div id="composer-pieces">

            {collection &&
                collection[selectedComposer].map((item, i) => {
                    const fileName = item.path.split("/").pop().replace(".mid", "").replace("_", " ");
                    return (
                        <button key={i} onClick={() => loadMidi(item.path)}
                            id={`${item.path === selectedMidiPath ? "selected-midi" : ""}`}

                        >
                            {fileName}
                        </button>
                    );
                })


            }




        </div>
    );
}
