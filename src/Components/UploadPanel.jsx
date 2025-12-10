// src/components/UploadPanel.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import { getFormsForAdmin } from "../api";
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

  // Graph mode and mapping wizard
  const [graphMode, setGraphMode] = useState("org_event");
  const [showMappingWizard, setShowMappingWizard] = useState(false);
  const [csvColumns, setCsvColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [extraAttrs, setExtraAttrs] = useState([]);
  const [customSrcCol, setCustomSrcCol] = useState("");
  const [customDstCol, setCustomDstCol] = useState("");
  const [customEdgeLabelCol, setCustomEdgeLabelCol] = useState("");

  // Flask backend for network conversion (separate from Node.js backend)
  // Port 5002 to avoid conflict with macOS AirPlay on port 5000
  const NETWORK_API = process.env.REACT_APP_NETWORK_API_URL || "http://localhost:5002";
  const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
  const ALLOWED = [".csv", ".xlsx", ".xls"];

  const hasAllowedExt = (name = "") =>
    ALLOWED.some((ext) => name.toLowerCase().endsWith(ext));

  // Fetch forms on component mount
  useEffect(() => {
    // TEMPORARILY DISABLED - form fetching causing 404 errors
    /*
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
    */
    setLoadingForms(false); // Skip form loading for now
  }, []);

  // Handle file upload from input
  const handleFileChange = async (e) => {
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

    // Read CSV headers for mapping wizard
    if (selected.length > 0) {
      await inspectFileHeaders(selected[0]);
    }
  };

  // Inspect CSV headers using FileReader
  const inspectFileHeaders = async (file) => {
    if (file.name.toLowerCase().endsWith('.csv')) {
      // Use Papa Parse for CSV
      Papa.parse(file, {
        preview: 1,
        complete: (results) => {
          if (results.data && results.data[0]) {
            setCsvColumns(results.data[0]);
            setShowMappingWizard(true);
            initializeMapping(results.data[0]);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        }
      });
    } else {
      // For Excel files, use backend /inspect endpoint
      const formData = new FormData();
      formData.append("file", file);

      try {
        const { data } = await axios.post(`${NETWORK_API}/inspect`, formData);
        setCsvColumns(data.columns || []);
        setShowMappingWizard(true);
        initializeMapping(data.columns || []);
      } catch (error) {
        console.error("Error inspecting file:", error);
        setMessage("Could not read file headers. Proceeding without mapping.");
      }
    }
  };

  // Initialize mapping with smart defaults
  const initializeMapping = (columns) => {
    const defaultMapping = {};
    const lowerCols = columns.map(c => c.toLowerCase());

    // Smart matching for common columns
    const matches = {
      orgName: ['org', 'organization', 'orgname', 'company'],
      sector: ['sector', 'type', 'industry', 'category'],
      addressCity: ['city', 'town', 'addresscity'],
      addressState: ['state', 'province', 'addressstate'],
      addressCountry: ['country', 'addresscountry'],
      eventId: ['eventid', 'event_id', 'conferenceid', 'conference_id'],
      eventName: ['eventname', 'event_name', 'event', 'conference', 'conferencename'],
      eventDate: ['date', 'eventdate', 'event_date', 'conferencedate'],
      connections: ['connections', 'related', 'links']
    };

    Object.entries(matches).forEach(([logicalName, patterns]) => {
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const lowerCol = lowerCols[i];
        if (patterns.some(pattern => lowerCol.includes(pattern))) {
          defaultMapping[logicalName] = col;
          break;
        }
      }
    });

    setMapping(defaultMapping);
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
    formData.append("graph_mode", graphMode);

    // Add mapping if wizard was shown
    if (showMappingWizard && Object.keys(mapping).length > 0) {
      const mappingWithExtras = { ...mapping };
      if (extraAttrs.length > 0) {
        mappingWithExtras.extraAttrs = extraAttrs;
      }
      formData.append("mapping", JSON.stringify(mappingWithExtras));
    }

    // Add custom columns for custom_ab mode
    if (graphMode === "custom_ab") {
      if (!customSrcCol || !customDstCol) {
        setMessage("Please select source and target columns for custom graph mode.");
        return;
      }
      formData.append("src_col", customSrcCol);
      formData.append("dst_col", customDstCol);
      if (customEdgeLabelCol) {
        formData.append("edge_label_col", customEdgeLabelCol);
      }
    }

    setBusy(true);
    setMessage("Converting…");
    clearPreviews();

    try {
      const { data } = await axios.post(`${NETWORK_API}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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

  // Handle mapping change
  const handleMappingChange = (logicalName, columnName) => {
    setMapping(prev => ({
      ...prev,
      [logicalName]: columnName
    }));
  };

  // Toggle extra attribute
  const toggleExtraAttr = (col) => {
    setExtraAttrs(prev => {
      if (prev.includes(col)) {
        return prev.filter(c => c !== col);
      } else {
        return [...prev, col];
      }
    });
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

          {/* Graph Mode Selector */}
          <div className="graph-mode-section">
            <h3>Step 1: Choose Graph Type</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              <strong>Standard Modes:</strong> Basic network structures
            </p>
            <div className="graph-mode-options">
              <label className={`graph-mode-option ${graphMode === 'org_event' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="graphMode"
                  value="org_event"
                  checked={graphMode === 'org_event'}
                  onChange={(e) => setGraphMode(e.target.value)}
                />
                <div className="mode-content">
                  <strong>Organizations ↔ Events</strong>
                  <span>Track which organizations attended which events</span>
                </div>
              </label>
              <label className={`graph-mode-option ${graphMode === 'org_org' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="graphMode"
                  value="org_org"
                  checked={graphMode === 'org_org'}
                  onChange={(e) => setGraphMode(e.target.value)}
                />
                <div className="mode-content">
                  <strong>Organizations ↔ Organizations</strong>
                  <span>Pure relationship network between organizations</span>
                </div>
              </label>
              <label className={`graph-mode-option ${graphMode === 'custom_ab' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="graphMode"
                  value="custom_ab"
                  checked={graphMode === 'custom_ab'}
                  onChange={(e) => setGraphMode(e.target.value)}
                />
                <div className="mode-content">
                  <strong>Custom A → B</strong>
                  <span>Choose your own source and target columns</span>
                </div>
              </label>
            </div>

            <hr style={{ margin: '24px 0', border: '0', borderTop: '2px solid #e5e7eb' }} />

            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              <strong>Sector-Based Modes (Beta):</strong> Three-layer architecture: Event → Sector → Organization
            </p>
            <div className="graph-mode-options">
              <label className={`graph-mode-option ${graphMode === 'event_sector_org_connections' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="graphMode"
                  value="event_sector_org_connections"
                  checked={graphMode === 'event_sector_org_connections'}
                  onChange={(e) => setGraphMode(e.target.value)}
                />
                <div className="mode-content">
                  <strong>Event → Sector → Org + Connections</strong>
                  <span>Full 3-layer network with org-org relationships</span>
                </div>
              </label>
              <label className={`graph-mode-option ${graphMode === 'event_sector_org_attendance' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="graphMode"
                  value="event_sector_org_attendance"
                  checked={graphMode === 'event_sector_org_attendance'}
                  onChange={(e) => setGraphMode(e.target.value)}
                />
                <div className="mode-content">
                  <strong>Event → Sector → Org (Clean)</strong>
                  <span>3-layer network showing attendance only</span>
                </div>
              </label>
              <label className={`graph-mode-option ${graphMode === 'org_event_only' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="graphMode"
                  value="org_event_only"
                  checked={graphMode === 'org_event_only'}
                  onChange={(e) => setGraphMode(e.target.value)}
                />
                <div className="mode-content">
                  <strong>Org + Event Only</strong>
                  <span>Simple bipartite graph (improved event labels)</span>
                </div>
              </label>
              <label className={`graph-mode-option ${graphMode === 'org_connections_only' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="graphMode"
                  value="org_connections_only"
                  checked={graphMode === 'org_connections_only'}
                  onChange={(e) => setGraphMode(e.target.value)}
                />
                <div className="mode-content">
                  <strong>Org Connections Only</strong>
                  <span>Pure organizational relationship network</span>
                </div>
              </label>
            </div>
          </div>

          {/* File Upload */}
          <div className="upload-section">
            <h3>Step 2: Upload Files</h3>
            <div className="upload-controls">
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
            </div>
          </div>

          {/* Mapping Wizard */}
          {showMappingWizard && csvColumns.length > 0 && (
            <div className="mapping-wizard">
              <h3>Step 3: Map Your Columns</h3>
              <p className="wizard-hint">Tell us which columns in your file correspond to the data we need</p>

              {graphMode === "custom_ab" ? (
                <div className="custom-mapping">
                  <div className="mapping-row">
                    <label>Source Column (From):</label>
                    <select value={customSrcCol} onChange={(e) => setCustomSrcCol(e.target.value)}>
                      <option value="">-- Select --</option>
                      {csvColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mapping-row">
                    <label>Target Column (To):</label>
                    <select value={customDstCol} onChange={(e) => setCustomDstCol(e.target.value)}>
                      <option value="">-- Select --</option>
                      {csvColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mapping-row">
                    <label>Edge Label (Optional):</label>
                    <select value={customEdgeLabelCol} onChange={(e) => setCustomEdgeLabelCol(e.target.value)}>
                      <option value="">-- None --</option>
                      {csvColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="standard-mapping">
                  <div className="mapping-grid">
                    <div className="mapping-row required">
                      <label>Organization Name:</label>
                      <select
                        value={mapping.orgName || ""}
                        onChange={(e) => handleMappingChange("orgName", e.target.value)}
                      >
                        <option value="">-- Select --</option>
                        {csvColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    {graphMode === "org_event" && (
                      <>
                        <div className="mapping-row required">
                          <label>Event ID:</label>
                          <select
                            value={mapping.eventId || ""}
                            onChange={(e) => handleMappingChange("eventId", e.target.value)}
                          >
                            <option value="">-- Select --</option>
                            {csvColumns.map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mapping-row required">
                          <label>Event Name:</label>
                          <select
                            value={mapping.eventName || ""}
                            onChange={(e) => handleMappingChange("eventName", e.target.value)}
                          >
                            <option value="">-- Select --</option>
                            {csvColumns.map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mapping-row required">
                          <label>Event Date:</label>
                          <select
                            value={mapping.eventDate || ""}
                            onChange={(e) => handleMappingChange("eventDate", e.target.value)}
                          >
                            <option value="">-- Select --</option>
                            {csvColumns.map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    <div className="mapping-row">
                      <label>Sector/Type (optional):</label>
                      <select
                        value={mapping.sector || ""}
                        onChange={(e) => handleMappingChange("sector", e.target.value)}
                      >
                        <option value="">-- None --</option>
                        {csvColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mapping-row">
                      <label>City (optional):</label>
                      <select
                        value={mapping.addressCity || ""}
                        onChange={(e) => handleMappingChange("addressCity", e.target.value)}
                      >
                        <option value="">-- None --</option>
                        {csvColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mapping-row">
                      <label>State (optional):</label>
                      <select
                        value={mapping.addressState || ""}
                        onChange={(e) => handleMappingChange("addressState", e.target.value)}
                      >
                        <option value="">-- None --</option>
                        {csvColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mapping-row">
                      <label>Country (optional):</label>
                      <select
                        value={mapping.addressCountry || ""}
                        onChange={(e) => handleMappingChange("addressCountry", e.target.value)}
                      >
                        <option value="">-- None --</option>
                        {csvColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mapping-row">
                      <label>Connections (optional):</label>
                      <select
                        value={mapping.connections || ""}
                        onChange={(e) => handleMappingChange("connections", e.target.value)}
                      >
                        <option value="">-- None --</option>
                        {csvColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Extra Attributes */}
                  <div className="extra-attrs-section">
                    <h4>Extra Attributes (optional)</h4>
                    <p>Select additional columns to include as node attributes:</p>
                    <div className="extra-attrs-list">
                      {csvColumns
                        .filter(col => !Object.values(mapping).includes(col))
                        .map(col => (
                          <label key={col} className="extra-attr-item">
                            <input
                              type="checkbox"
                              checked={extraAttrs.includes(col)}
                              onChange={() => toggleExtraAttr(col)}
                            />
                            {col}
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Convert button */}
          <div className="convert-section">
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
                  Convert to Network
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
              <b>Tip:</b> Select forms from the sidebar or upload CSV/Excel files. The mapping wizard helps match your column names automatically.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
