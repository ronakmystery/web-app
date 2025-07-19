import React, { useEffect } from "react";
import { usePiano } from "../../PianoContext"

export default function Composers() {

    const { selectedComposer, setSelectedComposer, collection, setNotes, audioRef, setIsPlaying } = usePiano()




    return (
        <div id="composers">

            {collection &&
                Object.entries(collection).map(([composer]) => (
                    <div key={composer}
                        id={composer}
                        onClick={() => setSelectedComposer(composer)}
                        className={`composer ${selectedComposer === composer ? "selected-composer" : ''}`}
                    >
                        <div
                            className="composer-image"
                            style={{
                                backgroundImage: `url(/composers/compressed/${composer}.jpg)`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat"
                            }}
                        ></div>

                        <div className="composer-name">  {composer.charAt(0).toUpperCase() + composer.slice(1)}</div>


                    </div>
                ))}



        </div>
    );
}
