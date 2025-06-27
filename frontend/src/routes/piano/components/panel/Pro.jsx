import { useEffect, useState } from "react";
import { Midi } from "@tonejs/midi";



export default function Pro({ parseMidi, selectedMidiPath, visible }) {
    // ✅ Handle custom file
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const buffer = await file.arrayBuffer();
        const midi = new Midi(buffer);
        parseMidi(midi);
        selectedMidiPath("");
    };

    return (
        <div id="pro"
            style={{ display: visible ? "block" : "none" }}>



            <input type="file" id="upload-midi"
                accept=".mid,.midi,audio/midi"

                onChange={handleFileChange} />

            <div>pro mode</div>

        </div>
    );
}
