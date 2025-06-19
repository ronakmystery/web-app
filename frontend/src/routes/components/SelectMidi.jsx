import { useEffect, useState } from "react";


export default function SelectMidi({ parseMidi, loadMidi ,selectedMidiPath}) {
    const [collection, setCollection] = useState(null);

    useEffect(() => {
        fetch("/midis.json")
            .then((res) => res.json())
            .then((data) => {

                setCollection(data)
            }
            )
            .catch((err) => console.error("Failed to load MIDI list", err));
    }, []);

    return (
        <div id="select-midi">

            {collection &&
                Object.entries(collection).map(([composer, files]) => (
                    <div key={composer} className="composer">
                        <div className="composer-image"> <img src={`/composers/${composer}.jpeg`} alt={composer} /></div>
                       
                        {composer.charAt(0).toUpperCase() + composer.slice(1)}
                        {files.sort((a,b)=>a.path -b.path).map((item, i) => {
                            const fileName = item.path.split("/").pop().replace(".mid", "").replace("_", " ");
                            return (
                                <button key={i} onClick={() => loadMidi(item.path)}
                                    id={`${item.path === selectedMidiPath ? "selected-midi" : ""}`}

                                >
                                    {fileName}
                                </button>
                            );
                        })}
                    </div>
                ))}



        </div>
    );
}
