import React, { useEffect, useRef, useState } from "react";
import { Midi } from "@tonejs/midi";

export default function Test() {
  const notesCanvasRef = useRef(null);
  const pianoCanvasRef = useRef(null);
  const [notes, setNotes] = useState([]);

  const scrollContainerRef = useRef(null);
  const [isDrawn, setIsDrawn] = useState(false);

  const canvasWidth = window.innerWidth;
  const keyWidth = canvasWidth / 88;
  const scrollSpeed = 100; // compress
  const pianoHeight = window.innerHeight * 0.1;

  const blackNotes = [1, 3, 6, 8, 10];
  const isBlack = (midi) => blackNotes.includes(midi % 12);


  useEffect(() => {
    const loadDefaultMidi = async () => {
      try {
        const res = await fetch("/w5.mid");
        const arrayBuffer = await res.arrayBuffer();
        const midi = new Midi(arrayBuffer);

        const allNotes = [];
        midi.tracks.forEach((track) => {
          track.notes.forEach((note) => {
            allNotes.push({
              midi: note.midi,
              time: note.time,
              duration: note.duration,
            });
          });
        });

        setNotes(allNotes);
        console.log("Loaded MIDI notes:", allNotes);
      } catch (err) {
        console.error("❌ Failed to load default MIDI:", err);
      }
    };

    loadDefaultMidi();
  }, []);

  useEffect(() => {
    if (!notes.length) return;

    const canvas = notesCanvasRef.current;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    const maxTime = Math.max(...notes.map((n) => n.time + n.duration));
    const scrollableHeight = maxTime * scrollSpeed;

    canvas.width = canvasWidth * dpr;
    canvas.height = scrollableHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${scrollableHeight}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvasWidth, scrollableHeight);

    notes.forEach((note) => {
      const x = (note.midi - 21) * keyWidth;
      const y = scrollableHeight - (note.time * scrollSpeed + note.duration * scrollSpeed);
      const height = note.duration * scrollSpeed;

      const isBlackKey = isBlack(note.midi);
      const width = isBlackKey ? keyWidth * 0.5 : keyWidth;
      const offset = isBlackKey ? (keyWidth * -0.25) : 0;

      ctx.fillStyle = isBlackKey ? "#2E7D32" : "#66BB6A";

      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x + offset, y, width, height, 4);
        ctx.fill();
      } else {
        ctx.fillRect(x + offset, y, width, height); // Fallback
      }
    });

    setIsDrawn(true); // trigger scroll in next useEffect

  }, [notes]);

  useEffect(() => {
  if (isDrawn && scrollContainerRef.current) {
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    setIsDrawn(false); // reset
  }
}, [isDrawn]);


  useEffect(() => {
    const canvas = pianoCanvasRef.current;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = pianoHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${pianoHeight}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvasWidth, pianoHeight);

    for (let i = 0; i < 88; i++) {
      const midi = i + 21;
      const note = midi % 12;
      const x = i * keyWidth;

      // Draw white keys
      ctx.fillStyle = "white";
      ctx.fillRect(x, 0, keyWidth, pianoHeight);
      ctx.strokeStyle = "black";
      ctx.strokeRect(x, 0, keyWidth, pianoHeight);

      // Draw black keys with rounded **bottom** corners
      if (blackNotes.includes(note)) {
        const w = keyWidth * 0.6;
        const h = pianoHeight * 0.5;
        const radius = 4;
        const x0 = x - keyWidth * 0.3;
        const y0 = 0;

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(x0, y0);                     // top-left
        ctx.lineTo(x0 + w, y0);                 // top-right
        ctx.lineTo(x0 + w, y0 + h - radius);    // straight down right
        ctx.quadraticCurveTo(
          x0 + w,
          y0 + h,
          x0 + w - radius,
          y0 + h
        );                                      // bottom-right corner
        ctx.lineTo(x0 + radius, y0 + h);        // bottom-left line
        ctx.quadraticCurveTo(
          x0,
          y0 + h,
          x0,
          y0 + h - radius
        );                                      // bottom-left corner
        ctx.closePath();
        ctx.fill();
      }
    }
  }, []);

  return (
    <div id="piano-app">

      <canvas
        id="piano-keys"
        ref={pianoCanvasRef}
        width={canvasWidth}
      ></canvas>

      <div id="piano-notes"
        ref={scrollContainerRef}
      >
        <canvas
          ref={notesCanvasRef}
          width={canvasWidth}
        ></canvas>
      </div>
    </div>
  );
}
