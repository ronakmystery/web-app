import { useEffect, useState } from "react";

export default function Test() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);     // for initial fetch
  const [uploading, setUploading] = useState(false); // for upload state
  const [status, setStatus] = useState("");

  const fetchFiles = async () => {
    try {
      const res = await fetch("/backend/list");
      if (!res.ok) throw new Error("Failed to load list");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("❌ Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setStatus("Uploading...");

    const res = await fetch("/backend/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setStatus("❌ Upload failed");
      setUploading(false);
      return;
    }

    const { id } = await res.json();
    setStatus("Processing...");

    const stream = new EventSource(`/backend/status_stream/${id}`);
    stream.onmessage = (e) => {
      if (e.data === "done") {
        stream.close();
        alert('finished processing...')
        setUploading(false);
        fetchFiles();
      } else {
        setStatus(`Status: ${e.data}`);
      }
    };
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    const res = await fetch(`/backend/delete/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } else {
      alert("❌ Failed to delete.");
    }
  };

  return (
    <div>
      <h2>🎵 Uploaded MIDI Files</h2>

      <form onSubmit={handleUpload} style={{ marginBottom: "1rem" }}>
        <input type="file" name="file"
          accept=".mid,.midi,audio/midi"
          disabled={uploading} />
        <button type="submit" disabled={uploading}>
          {uploading ? "Processing..." : "Upload MIDI"}
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : files.length === 0 ? (
        <p>No MIDI files found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {files.map((f) => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <audio controls src={`/backend/${f.mp3}`} style={{ flex: 1 }} />
              <button onClick={() => handleDelete(f.id)}>🗑️ Delete</button>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
