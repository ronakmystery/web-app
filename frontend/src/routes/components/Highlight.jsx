import React from "react";

export default function Highlight({ keyHeight, height }) {
  const style = {
    bottom:keyHeight,
    height,
    flexDirection: "column",
  };

  const blockStyle = {
    flex: 1,
    backgroundColor: "rgba(255, 255, 0, 0.3)",
    border: "1px solid gold",
  };

  return (
    <div id="highlight" style={style}>
      <div style={blockStyle} />
      <div style={blockStyle} />
      <div style={blockStyle} />
    </div>
  );
}
