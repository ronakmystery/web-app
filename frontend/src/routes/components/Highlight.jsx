import React from "react";

export default function Highlight({ keyHeight, height }) {
  const style = {
    bottom: keyHeight,
    height,
    flexDirection: "column",
  };



 const rowStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  borderTop: "2px solid var(--green)",
};

const subrowStyle = {
  flex: 1,
  borderTop: "1px solid var(--green)",
};



  return (
    <div id="highlight" style={style}>
      {/* Row 1 */}
      <div style={rowStyle}>
        <div style={subrowStyle} />
        <div style={subrowStyle} />
      </div>

      {/* Row 2 */}
      <div style={rowStyle}>
        <div style={subrowStyle} />
        <div style={subrowStyle} />
      </div>

      {/* Row 3 */}
      <div style={rowStyle}>
        <div style={subrowStyle} />
        <div style={subrowStyle} />
      </div>
    </div>
  );
}
