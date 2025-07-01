
import { usePiano } from "../../PianoContext"
import "./Composers.css"

export default function Composers() {

    const { selectedComposer, setSelectedComposer, collection } = usePiano()

    return (
        <div id="composers">

            {collection &&
                Object.entries(collection).map(([composer]) => (
                    <div key={composer}
                        id={composer}
                        onClick={() => setSelectedComposer(composer)}
                        className={`composer ${selectedComposer === composer ? "selected-composer" : ''}`}
                    >

                        <img
                            className="composer-image   "
                            src={`/composers/compressed/${composer}.jpg`} alt={composer} />
                        <div className="composer-name">  {composer.charAt(0).toUpperCase() + composer.slice(1)}</div>


                    </div>
                ))}



        </div>
    );
}
