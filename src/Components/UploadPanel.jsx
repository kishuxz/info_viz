// src/components/UploadPanel.jsx
import React, { useState } from "react";
import axios from "axios";

export default function UploadPanel() {
  const [files, setFiles] = useState([]);           // ← multiple files
  const [format, setFormat] = useState("gephi");    // "gephi" | "kumu"
  const [message, setMessage] = useState("");
  const [nodesUrl, setNodesUrl] = useState("");
  const [edgesUrl, setEdgesUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
  const ALLOWED = [".csv", ".xlsx", ".xls"];

  const hasAllowedExt = (name = "") =>
    ALLOWED.some((ext) => name.toLowerCase().endsWith(ext));

  // --- Validate and reset file selection (multi)
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const bad = selected.find((f) => !hasAllowedExt(f.name));
    if (bad) {
      setMessage("Please upload only .csv, .xlsx, or .xls files.");
      setFiles([]);
      return;
    }
    setFiles(selected);
    setMessage("");
    setNodesUrl("");
    setEdgesUrl("");
  };

  // --- Upload to Flask backend (multi)
  const handleUpload = async () => {
    if (!files.length) {
      setMessage("Select one or more files (.csv, .xlsx, .xls).");
      return;
    }

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));  // ← key: files
    formData.append("format", format);

    setBusy(true);
    setMessage("Converting…");
    setNodesUrl("");
    setEdgesUrl("");

    try {
      const { data } = await axios.post(`${API}/upload`, formData, {
        // Do NOT set Content-Type manually (browser adds boundary)
        withCredentials: false,
      });
      setMessage(data.message || "Conversion successful!");
      setNodesUrl(data.nodes_url);
      setEdgesUrl(data.edges_url);
    } catch (err) {
      console.error(err);
      const backendMsg = err?.response?.data?.error;
      setMessage(backendMsg || "Error converting file. Check console for details.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{ padding: 24, textAlign: "center" }}>
      <h3>Upload Event Data</h3>

      <div
        style={{
          display: "inline-flex",
          gap: 12,
          alignItems: "center",
          marginTop: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* File input (multi) */}
        <input
          type="file"
          multiple
          accept=".csv,.xlsx,.xls,.ods"
          onChange={handleFileChange}
        />
        {!!files.length && (
          <span style={{ fontSize: 12, color: "#444" }}>
            Selected: <b>{files.length}</b>{" "}
            {files.length === 1 ? "file" : "files"}{" "}
            <em style={{ opacity: 0.7 }}>
              ({files.slice(0, 2).map((f) => f.name).join(", ")}
              {files.length > 2 ? ", …" : ""})
            </em>
          </span>
        )}

        {/* Format selector */}
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          Format:
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={{ padding: "6px 8px" }}
          >
            <option value="gephi">Gephi (Source/Target)</option>
            <option value="kumu">Kumu (from/to)</option>
          </select>
        </label>

        {/* Convert button */}
        <button onClick={handleUpload} disabled={busy} style={{ padding: "6px 12px" }}>
          {busy ? "Converting…" : "Convert"}
        </button>
      </div>

      {/* Status message */}
      <p style={{ marginTop: 12, color: busy ? "#555" : "#222" }}>{message}</p>

      {/* Download links */}
      {nodesUrl && edgesUrl && (
        <div style={{ marginTop: 8 }}>
          <a href={nodesUrl} download>Download Nodes</a> |{" "}
          <a href={edgesUrl} download>Download Edges</a>
        </div>
      )}

      {/* Info tip */}
      <div style={{ marginTop: 16, fontSize: 12, color: "#666", lineHeight: 1.6 }}>
        <p>
          Tip: For <b>Kumu</b>, edges use <code>from</code>/<code>to</code> and nodes use <code>id</code>.
          For <b>Gephi</b>, edges use <code>Source</code>/<code>Target</code> and nodes use <code>Id</code>/<code>Label</code>.
          Files accepted: <code>.csv</code>, <code>.xlsx</code>, <code>.xls</code>. You can select multiple files to merge events.
        </p>
      </div>
    </section>
  );
}
