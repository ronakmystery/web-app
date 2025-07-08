import { useEffect } from "react";

function Test() {
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      console.warn("Web MIDI is not supported in this browser.");
    }

    function onMIDISuccess(midiAccess) {
      for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = handleMIDIMessage;
      }
    }

    function onMIDIFailure() {
      console.warn("Could not access your MIDI devices.");
    }

    function handleMIDIMessage(message) {
      const [status, note, velocity] = message.data;

      if (status === 144 && velocity > 0) {
        console.log("Note ON", note, velocity);
      } else if (status === 128 || (status === 144 && velocity === 0)) {
        console.log("Note OFF", note);
      }
    }
  }, []);

  return <div>MIDI Input is active</div>;
}

export default Test;
