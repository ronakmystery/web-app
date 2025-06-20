import { useEffect, useState } from "react";
import Composers from "./subcomponents/Composers";
import ComposerPieces from "./subcomponents/ComposerPieces";
import Pro from "./subcomponents/Pro";


export default function SelectMidi({ parseMidi, loadMidi, selectedMidiPath }) {
    const [collection, setCollection] = useState(null);
    const [selectedComposer, setSelectedComposer] = useState("chopin");

    useEffect(() => {
        fetch("/midis.json")
            .then((res) => res.json())
            .then((data) => {

                setCollection(data)
            }
            )
            .catch((err) => console.error("Failed to load MIDI list", err));
    }, []);


    const [layer,setLayer] = useState("samples");

    let layers={
        "samples":<div id="samples">  <Composers selectedComposer={selectedComposer}
                setSelectedComposer={setSelectedComposer}
                collection={collection} />

                <ComposerPieces selectedComposer={selectedComposer}
                    collection={collection}
                    selectedMidiPath={selectedMidiPath}
                    loadMidi={loadMidi}
                /></div>,
                "pro":<Pro parseMidi={parseMidi} selectedMidiPath={selectedMidiPath}/>,
    }

    return (
        <div id="select-midi">

            <div>
                {
                    Object.keys(layers).map((key) => (
                        <button key={key} onClick={() => setLayer(key)}
                            className={`${layer === key ? "selected-layer" : ""}`}
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                    ))
                }

            </div>

            
            {
                layers[layer]
            }





        </div>
    );
}
