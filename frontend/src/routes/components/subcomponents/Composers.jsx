import { useEffect, useState } from "react";


export default function Composers({ selectedComposer,setSelectedComposer, collection }) {


    return (
        <div id="composers">

            {collection &&
                Object.entries(collection).map(([composer]) => (
                    <div key={composer}
                        id={composer}
                        onClick={() => setSelectedComposer(composer)}
                        className={`composer ${selectedComposer === composer && "selected-composer"}`}
                    >

                        <div className="composer-info">
                            <div className="composer-image">
                                <img src={`/composers/${composer}.jpg`} alt={composer} />


                            </div>
                            <div className="composer-name">  {composer.charAt(0).toUpperCase() + composer.slice(1)}</div>
                        </div>


                    </div>
                ))}



        </div>
    );
}
