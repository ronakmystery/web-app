import { useEffect, useState } from "react";


export default function SelectMidi({ parseMidi, loadMidi }) {
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
                    <div key={composer}>
                        <h3>{composer.charAt(0).toUpperCase() + composer.slice(1)}</h3>
                        {files.map((item, i) => {
                            const fileName = item.path.split("/").pop().replace(".mid", "").replace("_", " ");
                            return (
                                <button key={i} onClick={() => loadMidi(item.path)}>
                                    🎵 {fileName}
                                </button>
                            );
                        })}
                    </div>
                ))}



        </div>
    );
}
