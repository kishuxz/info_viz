// src/components/UploadPanel.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getFormsForAdmin, getResponses } from "../api";
import "./UploadPanel.css";

export default function UploadPanel() {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState("gephi");
  const [message, setMessage] = useState("");
  const [nodesUrl, setNodesUrl] = useState("");
  const [edgesUrl, setEdgesUrl] = useState("");
  const [busy, setBusy] = useState(false);

  // New state for enhanced features
  const [forms, setForms] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [nodesPreview, setNodesPreview] = useState(null);
  const [edgesPreview, setEdgesPreview] = useState(null);

  const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
  const ALLOWED = [".csv", ".xlsx", ".xls"];

  const hasAllowedExt = (name = "") =>
    ALLOWED.some((ext) => name.toLowerCase().endsWith(ext));

  // Fetch forms on component mount
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const adminId = localStorage.getItem('adminId');
        if (adminId) {
          const formsData = await getFormsForAdmin(adminId);
          setForms(formsData || []);
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setLoadingForms(false);
      }
    };
    fetchForms();
  }, []);

  // Handle file upload from input
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
    clearPreviews();
  };

  // Toggle form selection
  const toggleFormSelection = (formId) => {
    setSelectedForms(prev => {
      if (prev.includes(formId)) {
        return prev.filter(id => id !== formId);
      } else {
        return [...prev, formId];
      }
    });
  };

  // Clear preview data
  const clearPreviews = () => {
    setNodesUrl("");
    setEdgesUrl("");
    setNodesPreview(null);
    setEdgesPreview(null);
  };

  // Parse CSV preview data
  const parseCSVPreview = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return null;

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1, 11).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    });

    return { headers, rows };
  };

  // Download and parse preview data
  const fetchPreviewData = async (url) => {
    try {
      const response = await axios.get(url);
      return parseCSVPreview(response.data);
    } catch (error) {
      console.error("Error fetching preview:", error);
      return null;
    }
  };

  // Handle upload and conversion
  const handleUpload = async () => {
    if (!files.length && selectedForms.length === 0) {
      setMessage("Select files or forms from the sidebar to convert.");
      return;
    }

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("format", format);

    // TODO: Add selected form data to formData if needed
    // This would require backend support for form IDs

    setBusy(true);
    setMessage("Converting…");
    clearPreviews();

    try {
      const { data } = await axios.post(`${API}/upload`, formData, {
        withCredentials: false,
      });
      setMessage(data.message || "Conversion successful!");
      setNodesUrl(data.nodes_url);
      setEdgesUrl(data.edges_url);

      // Fetch preview data
      if (data.nodes_url && data.edges_url) {
        const [nodesPrev, edgesPrev] = await Promise.all([
          fetchPreviewData(data.nodes_url),
          fetchPreviewData(data.edges_url)
        ]);
        setNodesPreview(nodesPrev);
        setEdgesPreview(edgesPrev);
      }
    } catch (err) {
      console.error(err);
      const backendMsg = err?.response?.data?.error;
      setMessage(backendMsg || "Error converting file. Check console for details.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="upload-panel-container">
      {/* Sidebar for Forms */}
      <aside className="forms-sidebar">
        <h3>Your Forms</h3>
        {loadingForms ? (
          <p className="loading-forms">Loading forms...</p>
        ) : forms.length === 0 ? (
          <p className="no-forms">No forms created yet</p>
        ) : (
          <div className="forms-list">
            {forms.map(form => (
              <div
                key={form.id}
                className={`form-item ${selectedForms.includes(form.id) ? 'selected' : ''}`}
                onClick={() => toggleFormSelection(form.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedForms.includes(form.id)}
                  onChange={() => { }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="form-details">
                  <h4>{form.title || 'Untitled Form'}</h4>
                  <p>{form.description || 'No description'}</p>
                  <span className="form-date">{new Date(form.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedForms.length > 0 && (
          <div className="selected-count">
            {selectedForms.length} form{selectedForms.length > 1 ? 's' : ''} selected
          </div>
        )}
      </aside>

      {/* Main Upload Area */}
      <main className="upload-main">
        <div className="upload-panel">
          <h2>Upload & Convert Event Data</h2>
          <p className="subtitle">Transform your data into network nodes and edges</p>

          <div className="upload-controls">
            {/* File input */}
            <div className="file-input-wrapper">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="file-upload-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Choose Files
              </label>
              {!!files.length && (
                <span className="file-info">
                  <b>{files.length}</b> file{files.length > 1 ? 's' : ''} selected
                </span>
              )}
            </div>

            {/* Format selector */}
            <div className="format-selector">
              <label>Output Format:</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="gephi">Gephi (Source/Target)</option>
                <option value="kumu">Kumu (from/to)</option>
              </select>
            </div>

            {/* Convert button */}
            <button onClick={handleUpload} disabled={busy} className="convert-button">
              {busy ? (
                <>
                  <span className="spinner"></span>
                  Converting...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  Convert
                </>
              )}
            </button>
          </div>

          {/* Status message */}
          {message && (
            <div className={`status-message ${busy ? 'processing' : nodesUrl ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {/* Download links */}
          {nodesUrl && edgesUrl && (
            <div className="download-links">
              <a href={nodesUrl} download className="download-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Nodes
              </a>
              <a href={edgesUrl} download className="download-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Edges
              </a>
            </div>
          )}

          {/* Preview Tables */}
          {(nodesPreview || edgesPreview) && (
            <div className="preview-section">
              <h3>Data Preview (First 10 Rows)</h3>

              {nodesPreview && (
                <div className="preview-table-container">
                  <h4>Nodes</h4>
                  <div className="table-scroll">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          {nodesPreview.headers.map((header, idx) => (
                            <th key={idx}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {nodesPreview.rows.map((row, idx) => (
                          <tr key={idx}>
                            {nodesPreview.headers.map((header, cellIdx) => (
                              <td key={cellIdx}>{row[header]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {edgesPreview && (
                <div className="preview-table-container">
                  <h4>Edges</h4>
                  <div className="table-scroll">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          {edgesPreview.headers.map((header, idx) => (
                            <th key={idx}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {edgesPreview.rows.map((row, idx) => (
                          <tr key={idx}>
                            {edgesPreview.headers.map((header, cellIdx) => (
                              <td key={cellIdx}>{row[header]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info tip */}
          <div className="upload-info">
            <p>
              <b>Tip:</b> Select forms from the sidebar or upload CSV/Excel files. For <b>Kumu</b>, edges use <code>from</code>/<code>to</code>. For <b>Gephi</b>, edges use <code>Source</code>/<code>Target</code>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
