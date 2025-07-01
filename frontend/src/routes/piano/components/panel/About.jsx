
import "./About.css";
export default function About({ visible }) {

    return (
        <div id="about"
            style={{ display: visible ? "block" : "none" }}>

            <p>
                🔓 <strong>Unlock Pro Mode</strong> to access these features:
            </p>
            <div id="pro-features">
                <div>📤 Upload your own MIDI files</div>
                <div>🔁 Reverse the MIDI file</div>
                <div>🎮 Retro gameboy-style soundfont option</div>
            </div>

            <div
                id="about-footer"
            >

            </div>


        </div>
    );
}
