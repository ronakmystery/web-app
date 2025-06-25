import { useEffect, useState } from "react";

export default function Test() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch list on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/backend/list");
        if (!res.ok) throw new Error("Failed to load list");

        const data = await res.json();
        setFiles(data);
        console.log(data)
      } catch (err) {
        console.error("❌ Error fetching files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/backend/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("✅ Uploaded!");
    } else {
      alert("❌ Upload failed.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (files.length === 0) return <p>No MIDI files found.</p>;

  return (
    <div>
      <h2>🎵 Uploaded MIDI Files</h2>

      {files.map((f) => (
        <audio
          key={f.id}
          controls src={`backend/${f.mp3}`}></audio>

      ))}
      <form onSubmit={handleUpload}>
        <input type="file" name="file" accept=".mid" />
        <button type="submit">Upload MIDI</button>
      </form>
    </div>
  );
}
