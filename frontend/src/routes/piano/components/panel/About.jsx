
import "./About.css";
export default function About({ visible }) {

    return (
        <div id="about"
            style={{ display: visible ? "block" : "none" }}>

            <p>
                🧑‍💻 PRO has to access these features:
            </p>
            <div id="pro-features">
                <div>📤 Upload your own MIDI files</div>
                <div>🔁 Reverse the MIDI file</div>
                <div>🎮 Retro gameboy-style soundfont option</div>
            </div>

            Get CODE for <strong>Pro Mode</strong> by supporting me on Patreon!
            <a href="https://www.patreon.com/ronakmystery" className="app-link"
                target='_blank' >
                <button>PATREON</button>
            </a>





            <div
                id="about-footer"
            >

            </div>


        </div>
    );
}
