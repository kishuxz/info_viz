// src/AnalyticsDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getFormsForAdmin, getResponses } from "../api";
import AdminOnlyMessage from "./AdminOnlyMessage";
import Papa from "papaparse";
import "./AnalyticsDashboard.css";
import axios from "axios";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from "recharts";

// Highlight color for selected sector (different from palette colors)
const HIGHLIGHT_COLOR = "#0d6efd";

// Palette for non-selected bars / pie slices (no HIGHLIGHT_COLOR here)
const CHART_COLORS = [
    "#0099ffff",
    "#20c997",
    "#ffc107",
    "#fd7e14",
    "#6f42c1",
    "#198754",
    "#e83e8c",
    "#6610f2",
    "#dc3545",
    "#0dcaf0",
];

// Renders X-axis labels on multiple lines if they’re too long
const MultiLineTick = ({ x, y, payload, maxChars = 12 }) => {
    const value = (payload.value || "").toString();

    // naive word wrap by characters
    const words = value.split(" ");
    const lines = [];
    let current = "";

    words.forEach((word) => {
        const test = current ? `${current} ${word}` : word;
        if (test.length > maxChars) {
            if (current) lines.push(current);
            current = word;
        } else {
            current = test;
        }
    });
    if (current) lines.push(current);

    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} textAnchor="middle" fill="#666">
                {lines.map((line, idx) => (
                    <tspan key={idx} x={0} dy={idx === 0 ? 0 : 12}>
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
};

const MAX_TABLE_CELL_CHARS = 80;

const formatTableCell = (value, maxChars = MAX_TABLE_CELL_CHARS) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.length <= maxChars) return str;
    return str.slice(0, maxChars) + "...";
};

function parseCsv(text) {
    const result = Papa.parse(text, {
        header: true, // first row = headers
        skipEmptyLines: true,
        dynamicTyping: false, // keep everything as strings
    });

    if (result.errors && result.errors.length) {
        console.warn("CSV parse errors:", result.errors);
    }

    return result.data || [];
}

// ------- helpers for grouping -------

function buildBarDataFromRows(rows, getKey, maxItems = 10) {
    const counts = {};
    rows.forEach((r) => {
        const key = (getKey(r) || "").trim();
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
    });
    const arr = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    return arr.slice(0, maxItems);
}

function buildPieDataFromRows(rows, getKey, maxItems = 6) {
    const counts = {};
    rows.forEach((r) => {
        const key = (getKey(r) || "").trim();
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
    });
    let arr = Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    if (arr.length > maxItems) {
        const top = arr.slice(0, maxItems);
        const rest = arr.slice(maxItems);
        const otherTotal = rest.reduce((sum, x) => sum + x.value, 0);
        top.push({ name: "Others", value: otherTotal });
        arr = top;
    }
    return arr;
}

// central place to parse the "connections" column safely
function parseConnectionsFromRow(r) {
    const raw = r.connections;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;

    if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed;
            return [];
        } catch {
            return [];
        }
    }
    return [];
}

function buildConnectionBarData(rows, getKey, maxItems = 10) {
    const counts = {};
    rows.forEach((r) => {
        const parsed = parseConnectionsFromRow(r);
        if (!Array.isArray(parsed)) return;
        parsed.forEach((c) => {
            const key = (getKey(c, r) || "").trim();
            if (!key) return;
            counts[key] = (counts[key] || 0) + 1;
        });
    });

    const arr = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    return arr.slice(0, maxItems);
}

function buildConnectionPieData(rows, getKey, maxItems = 6) {
    const counts = {};
    rows.forEach((r) => {
        const parsed = parseConnectionsFromRow(r);
        if (!Array.isArray(parsed)) return;
        parsed.forEach((c) => {
            const key = (getKey(c, r) || "").trim();
            if (!key) return;
            counts[key] = (counts[key] || 0) + 1;
        });
    });

    let arr = Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    if (arr.length > maxItems) {
        const top = arr.slice(0, maxItems);
        const rest = arr.slice(maxItems);
        const otherTotal = rest.reduce((sum, x) => sum + x.value, 0);
        top.push({ name: "Others", value: otherTotal });
        arr = top;
    }
    return arr;
}

function findFieldKey(rows, candidates) {
    if (!rows || rows.length === 0) return null;
    const keys = Object.keys(rows[0]).map((k) => k.toLowerCase());
    for (const c of candidates) {
        const idx = keys.findIndex((k) => k.includes(c));
        if (idx >= 0) return Object.keys(rows[0])[idx];
    }
    return null;
}

function AnalyticsDashboard() {
    const adminId = localStorage.getItem("adminId") || "";
    const adminName = localStorage.getItem("adminName") || adminId;

    // NEW: labels for current data + last conversion
    const [dataSourceLabel, setDataSourceLabel] = useState("");
    const [lastConvertedLabel, setLastConvertedLabel] = useState("");

    const [forms, setForms] = useState([]);
    const [formsLoading, setFormsLoading] = useState(false);
    const [formsError, setFormsError] = useState("");

    const [selectedFormId, setSelectedFormId] = useState("");
    const [selectedForm, setSelectedForm] = useState(null);

    const [rows, setRows] = useState([]);
    const [rowsLoading, setRowsLoading] = useState(false);
    const [rowsError, setRowsError] = useState("");

    const [usingUploadedCsv, setUsingUploadedCsv] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // global sector filter
    const [selectedSector, setSelectedSector] = useState("");

    const NETWORK_API = 'https://mapping-analyzing-participation.onrender.com' || "http://127.0.0.1:5000";

    // network conversion (nodes/edges) state
    const [convertFormat, setConvertFormat] = useState("gephi");
    const [convertMessage, setConvertMessage] = useState("");
    const [nodesUrl, setNodesUrl] = useState("");
    const [edgesUrl, setEdgesUrl] = useState("");
    const [convertBusy, setConvertBusy] = useState(false);

    // convert current rows to network files
    const handleConvertToNetworkFiles = async () => {
        if (!rows || rows.length === 0) {
            setConvertMessage("Load a form or upload a CSV first.");
            return;
        }

        const sourceLabel = usingUploadedCsv
            ? dataSourceLabel
                ? `file "${dataSourceLabel}"`
                : "uploaded CSV"
            : dataSourceLabel
                ? `form "${dataSourceLabel}"`
                : "selected form";

        try {
            setConvertBusy(true);
            setConvertMessage("Converting current data…");
            setNodesUrl("");
            setEdgesUrl("");

            const csv = Papa.unparse(rows);

            const formData = new FormData();
            const blob = new Blob([csv], { type: "text/csv" });
            formData.append("files", blob, "analytics-data.csv");
            formData.append("format", convertFormat);

            const { data } = await axios.post(`${NETWORK_API}/upload`, formData, {
                withCredentials: false,
            });

            setConvertMessage(data.message || "Conversion successful!");
            setNodesUrl(data.nodes_url);
            setEdgesUrl(data.edges_url);
            setLastConvertedLabel(sourceLabel);
        } catch (err) {
            console.error(err);
            const backendMsg = err?.response?.data?.error;
            setConvertMessage(
                backendMsg || "Error converting current data. Check console for details."
            );
        } finally {
            setConvertBusy(false);
        }
    };

    // load forms
    useEffect(() => {
        if (!adminId) return;
        setFormsLoading(true);
        setFormsError("");
        getFormsForAdmin(adminId)
            .then((data) => {
                const list = data.forms || data || [];
                setForms(list);
                if (list.length > 0) {
                    const first = list[0];
                    setSelectedFormId(first.id);
                    setSelectedForm(first);
                    setDataSourceLabel(
                        first.eventName || first.title || first.name || `Form ${first.id}`
                    );
                }
            })
            .catch(() => setFormsError("Unable to load your forms."))
            .finally(() => setFormsLoading(false));
    }, [adminId]);

    // load responses
    useEffect(() => {
        if (!selectedFormId || usingUploadedCsv) return;
        setRowsLoading(true);
        setRowsError("");
        getResponses(selectedFormId)
            .then((data) => {
                setRows(data.rows || []);
                setSelectedSector("");
            })
            .catch(() =>
                setRowsError("Unable to load responses for the selected form.")
            )
            .finally(() => setRowsLoading(false));
    }, [selectedFormId, usingUploadedCsv]);

    const LONG_TEXT_COLUMNS = [
        "connections",
        "addressStreet",
        "eventId",
        "eventName",
    ];

    // sector filter
    const filteredRows = useMemo(() => {
        if (!selectedSector) return rows;
        return rows.filter((r) => (r.sector || "").trim() === selectedSector);
    }, [rows, selectedSector]);

    // metrics (on filtered rows)
    const metrics = useMemo(() => {
        const totalParticipants = filteredRows.length;
        const orgSet = new Set();
        const sectorSet = new Set();
        let totalConnections = 0;
        let participantsWithConnections = 0;

        filteredRows.forEach((r) => {
            if (r.orgName) orgSet.add(r.orgName);
            if (r.sector) sectorSet.add(r.sector);

            const parsedConnections = parseConnectionsFromRow(r);
            if (parsedConnections.length > 0) {
                participantsWithConnections += 1;
                totalConnections += parsedConnections.length;
            }
        });

        const uniqueOrgs = orgSet.size;
        const uniqueSectors = sectorSet.size;
        const avgConnections =
            totalParticipants > 0
                ? (totalConnections / totalParticipants).toFixed(2)
                : "0.00";

        return {
            totalParticipants,
            uniqueOrgs,
            uniqueSectors,
            avgConnections,
            participantsWithConnections,
        };
    }, [filteredRows]);

    const pageTitle =
        usingUploadedCsv && !selectedForm
            ? "Uploaded CSV"
            : selectedForm?.eventName ||
            selectedForm?.title ||
            selectedFormId ||
            "No form selected";

    const handleCsvUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setDataSourceLabel(file.name);

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const text = String(ev.target?.result || "");
                const parsedRows = parseCsv(text);
                setRows(parsedRows);
                setUsingUploadedCsv(true);
                setSelectedForm(null);
                setSelectedFormId("");
                setRowsError("");
                setSelectedSector("");
            } catch (err) {
                console.error(err);
                setRowsError("Failed to parse CSV file.");
            }
        };
        reader.readAsText(file);
    };

    const handleSelectForm = (form) => {
        setUsingUploadedCsv(false);
        setSelectedFormId(form.id);
        setSelectedForm(form);
        setSelectedSector("");
        setDataSourceLabel(
            form.eventName || form.title || form.name || `Form ${form.id}`
        );
    };

    const filteredForms = useMemo(() => {
        if (!searchTerm.trim()) return forms;
        const q = searchTerm.toLowerCase();
        return forms.filter((f) => {
            const title = (f.title || f.eventName || f.id || "").toLowerCase();
            return title.includes(q);
        });
    }, [forms, searchTerm]);

    // auto-detect keys
    const emailFieldKey = useMemo(
        () => findFieldKey(rows, ["email"]),
        [rows]
    );
    const cityFieldKey = useMemo(
        () => findFieldKey(rows, ["addresscity", "city"]),
        [rows]
    );
    const stateFieldKey = useMemo(
        () => findFieldKey(rows, ["addressstate", "state"]),
        [rows]
    );

    // charts ------------------------

    const sectorBarData = useMemo(
        () =>
            buildBarDataFromRows(
                rows,
                (r) => r.sector || "Unknown sector",
                8
            ),
        [rows]
    );

    const stateBarData = useMemo(
        () =>
            buildBarDataFromRows(
                filteredRows,
                (r) =>
                    (stateFieldKey && r[stateFieldKey]) ||
                    r.addressState ||
                    r.state ||
                    "Unknown",
                8
            ),
        [filteredRows, stateFieldKey]
    );

    const cityBarData = useMemo(
        () =>
            buildBarDataFromRows(
                filteredRows,
                (r) =>
                    (cityFieldKey && r[cityFieldKey]) ||
                    r.addressCity ||
                    r.city ||
                    "Unknown",
                8
            ),
        [filteredRows, cityFieldKey]
    );

    const emailDomainPieData = useMemo(() => {
        if (!emailFieldKey) return [];
        return buildPieDataFromRows(filteredRows, (r) => {
            const email = (r[emailFieldKey] || "").toString().toLowerCase();
            if (!email.includes("@")) return "";
            return email.split("@").pop();
        });
    }, [filteredRows, emailFieldKey]);

    const connectionTypeBarData = useMemo(
        () =>
            buildConnectionBarData(
                filteredRows,
                (c) => c.connectionType || c.type || "",
                5
            ),
        [filteredRows]
    );

    const connectedOrgPieData = useMemo(
        () =>
            buildConnectionPieData(
                filteredRows,
                (c) => c.connectionOrg || c.organization || c.orgName || "",
                6
            ),
        [filteredRows]
    );

    if (!adminId) {
        return <AdminOnlyMessage />;
    }

    const handleSectorClick = (sectorName) => {
        setSelectedSector((prev) => (prev === sectorName ? "" : sectorName));
    };

    return (
        <div className="analytics-dashboard">
            {/* Shared gradient hero with Admin page */}
            <div className="analytics-hero px-4 px-md-5 py-4">
                <div className="container d-flex justify-content-between align-items-start">
                    <div>
                        <div className="analytics-hero-kicker mb-2">
                            FORM BUILDER · ANALYTICS WORKSPACE
                        </div>
                        <h1 className="analytics-hero-title mb-1">
                            Hi {adminName || "there"},{" "}
                            <span>let&apos;s explore your event analytics.</span>
                        </h1>
                        <p className="analytics-hero-subtitle mb-0">
                            Choose an event form or upload a CSV to explore participants,
                            connections, and relationships.
                        </p>
                    </div>

                    <div className="d-none d-md-block">
                        <Link to="/builder" className="btn btn-light analytics-hero-cta">
                            {"<"} Back to Forms
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content area */}
            <div className="container analytics-body my-4">
                <div className="row g-4">
                    {/* LEFT SIDEBAR – now shorter & scrollable, with CSV + network below */}
                    <div className="col-lg-4">
                        {/* Forms list */}
                        <div className="card mb-3 shadow-sm border-0">
                            <div className="card-body d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="card-title mb-0">Your Event Forms</h5>
                                    <span className="badge bg-primary-subtle text-primary small px-3 py-2 rounded-pill">
                                        {adminName}
                                    </span>
                                </div>
                                <p className="text-muted small mb-3">
                                    Select a form to load analytics, or upload a CSV below.
                                </p>

                                <div className="input-group input-group-sm mb-3">
                                    <span className="input-group-text bg-body border-end-0">
                                        🔍
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search by event name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {formsLoading ? (
                                    <p className="text-muted small mb-0">Loading forms...</p>
                                ) : formsError ? (
                                    <p className="text-danger small mb-0">{formsError}</p>
                                ) : forms.length === 0 ? (
                                    <p className="text-muted small mb-0">
                                        No forms found. Create one in the Admin page first.
                                    </p>
                                ) : filteredForms.length === 0 ? (
                                    <p className="text-muted small mb-0">
                                        No forms match your search.
                                    </p>
                                ) : (
                                    <div
                                        className="mt-1"
                                        style={{
                                            maxHeight: "260px", // ~5 items, then scroll
                                            overflowY: "auto",
                                        }}
                                    >
                                        {filteredForms.map((f) => {
                                            const isActive =
                                                selectedFormId === f.id && !usingUploadedCsv;
                                            const title =
                                                f.title || f.eventName || "Untitled event";
                                            const dateLabel = f.eventDate || "";

                                            return (
                                                <div
                                                    key={f.id}
                                                    className={`position-relative p-3 mb-2 rounded-4 border border-3 ${isActive
                                                            ? "bg-primary text-white border-primary shadow-sm"
                                                            : "bg-white border-light"
                                                        }`}
                                                    style={{
                                                        cursor: "pointer",
                                                        transition:
                                                            "background-color 0.15s, box-shadow 0.15s, transform 0.1s",
                                                    }}
                                                    onClick={() => handleSelectForm(f)}
                                                    onMouseEnter={(e) => {
                                                        if (!isActive)
                                                            e.currentTarget.classList.add("shadow-sm");
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isActive)
                                                            e.currentTarget.classList.remove("shadow-sm");
                                                    }}
                                                >
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <div className="fw-semibold">{title}</div>
                                                            {dateLabel && (
                                                                <div
                                                                    className={
                                                                        isActive
                                                                            ? "text-light small"
                                                                            : "text-muted small"
                                                                    }
                                                                >
                                                                    {dateLabel}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span
                                                            className={`badge rounded-pill ${isActive
                                                                    ? "bg-light text-primary"
                                                                    : "bg-primary-subtle text-primary"
                                                                }`}
                                                        >
                                                            {f.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CSV upload – sits directly under the short forms card */}
                        <div className="card shadow-sm border-0 mb-3">
                            <div className="card-body">
                                <h6 className="card-title mb-2">Upload CSV for Analytics</h6>
                                <p className="text-muted small">
                                    You can upload any CSV (e.g., exported from this app or
                                    cleaned externally). The dashboard will use the uploaded file
                                    until you select a form again.
                                </p>
                                <input
                                    type="file"
                                    className="form-control form-control-sm mb-2"
                                    accept=".csv,text/csv"
                                    onChange={handleCsvUpload}
                                />
                                {usingUploadedCsv && (
                                    <span className="badge bg-success">Using uploaded CSV</span>
                                )}
                            </div>
                        </div>

                        {/* Convert current data to nodes/edges – right under CSV card */}
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <h6 className="card-title mb-2">Convert to Network Files</h6>
                                <p className="text-muted small mb-2">
                                    Use the currently loaded table (selected form or uploaded CSV)
                                    to generate <strong>nodes</strong> and <strong>edges</strong>{" "}
                                    CSVs for Gephi or Kumu.
                                </p>

                                {dataSourceLabel && (
                                    <p className="small mb-1">
                                        Current data: <strong>{dataSourceLabel}</strong>
                                    </p>
                                )}

                                {lastConvertedLabel && (
                                    <p className="small mb-2">
                                        Last converted from: <strong>{lastConvertedLabel}</strong>
                                    </p>
                                )}

                                <div
                                    className="d-flex flex-wrap align-items-center mb-2"
                                    style={{ gap: 8 }}
                                >
                                    <label className="small mb-0">
                                        Format:&nbsp;
                                        <select
                                            value={convertFormat}
                                            onChange={(e) => setConvertFormat(e.target.value)}
                                            className="form-select form-select-sm d-inline-block"
                                            style={{ width: "auto" }}
                                        >
                                            <option value="gephi">Gephi (Source/Target)</option>
                                            <option value="kumu">Kumu (from/to)</option>
                                        </select>
                                    </label>

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={handleConvertToNetworkFiles}
                                        disabled={convertBusy}
                                    >
                                        {convertBusy ? "Converting..." : "Convert"}
                                    </button>
                                </div>

                                {convertMessage && (
                                    <p className="small mb-1">{convertMessage}</p>
                                )}

                                {nodesUrl && edgesUrl && (
                                    <div className="small">
                                        <a href={nodesUrl} download>
                                            Download Nodes CSV
                                        </a>
                                        {" · "}
                                        <a href={edgesUrl} download>
                                            Download Edges CSV
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: analytics */}
                    <div className="col-lg-8">
                        {/* Event header + metrics */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h5 className="mb-1">{pageTitle}</h5>
                                        {usingUploadedCsv ? (
                                            <p className="text-muted mb-0 small">
                                                Data source: Uploaded CSV file
                                            </p>
                                        ) : selectedForm ? (
                                            <p className="text-muted mb-0 small">
                                                Event ID: {selectedForm.id}{" "}
                                                {selectedForm.eventDate && (
                                                    <>| Date: {selectedForm.eventDate}</>
                                                )}
                                            </p>
                                        ) : (
                                            <p className="text-muted mb-0 small">
                                                Select a form or upload a CSV to get started.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {rowsError && (
                                    <div className="alert alert-danger py-2 mb-2">
                                        {rowsError}
                                    </div>
                                )}

                                {selectedSector && (
                                    <div className="alert alert-info py-2 px-3 small mb-3">
                                        Filtering by sector: <strong>{selectedSector}</strong>{" "}
                                        <button
                                            className="btn btn-link btn-sm p-0 ms-1"
                                            onClick={() => setSelectedSector("")}
                                        >
                                            (clear)
                                        </button>
                                    </div>
                                )}

                                {rowsLoading ? (
                                    <p className="text-muted mb-0">Loading data...</p>
                                ) : (
                                    <div className="row g-3">
                                        <div className="col-md-3 col-6">
                                            <div className="border rounded-3 p-3 bg-light h-100">
                                                <div className="text-muted small">
                                                    Total Participants
                                                </div>
                                                <div className="fs-4 fw-semibold">
                                                    {metrics.totalParticipants}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3 col-6">
                                            <div className="border rounded-3 p-3 bg-light h-100">
                                                <div className="text-muted small">Organizations</div>
                                                <div className="fs-4 fw-semibold">
                                                    {metrics.uniqueOrgs}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3 col-6">
                                            <div className="border rounded-3 p-3 bg-light h-100">
                                                <div className="text-muted small">
                                                    Avg Connections
                                                </div>
                                                <div className="fs-4 fw-semibold">
                                                    {metrics.avgConnections}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3 col-6">
                                            <div className="border rounded-3 p-3 bg-light h-100">
                                                <div className="text-muted small">
                                                    Unique Sectors
                                                </div>
                                                <div className="fs-4 fw-semibold">
                                                    {metrics.uniqueSectors}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Demographics */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <h5 className="card-title mb-3">Participant Demographics</h5>
                                <div className="row g-3">
                                    {/* Participants by Sector */}
                                    <div className="col-md-6">
                                        <div className="border rounded-3 p-3 bg-light h-100 d-flex flex-column">
                                            <h6 className="mb-2">Participants by Sector</h6>
                                            {sectorBarData.length === 0 ? (
                                                <p className="text-muted small mb-0">
                                                    No sector data available.
                                                </p>
                                            ) : (
                                                <div
                                                    className="flex-grow-1 d-flex align-items-center"
                                                    style={{ minHeight: 300 }}
                                                >
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                        className="chart-container"
                                                    >
                                                        <BarChart
                                                            data={sectorBarData}
                                                            layout="vertical"
                                                            margin={{
                                                                top: 5,
                                                                right: 10,
                                                                left: 0,
                                                                bottom: 5,
                                                            }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis
                                                                type="number"
                                                                allowDecimals={false}
                                                                domain={[0, "dataMax"]}
                                                            />
                                                            <YAxis
                                                                type="category"
                                                                dataKey="name"
                                                                width={110}
                                                            />
                                                            <Tooltip />
                                                            <Bar dataKey="count" name="Participants">
                                                                {sectorBarData.map((entry, index) => (
                                                                    <Cell
                                                                        key={entry.name}
                                                                        fill={
                                                                            entry.name === selectedSector
                                                                                ? HIGHLIGHT_COLOR
                                                                                : CHART_COLORS[
                                                                                index % CHART_COLORS.length
                                                                                ]
                                                                        }
                                                                        cursor="pointer"
                                                                        onClick={() =>
                                                                            handleSectorClick(entry.name)
                                                                        }
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Participants by State */}
                                    <div className="col-md-6">
                                        <div className="border rounded-3 p-3 bg-light h-100 d-flex flex-column">
                                            <h6 className="mb-2">Participants by State</h6>
                                            {stateBarData.length === 0 ? (
                                                <p className="text-muted small mb-0">
                                                    No state / region data available.
                                                </p>
                                            ) : (
                                                <div
                                                    className="flex-grow-1 d-flex align-items-center"
                                                    style={{ minHeight: 300 }}
                                                >
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                        className="chart-container"
                                                    >
                                                        <BarChart
                                                            data={stateBarData}
                                                            layout="vertical"
                                                            margin={{
                                                                top: 5,
                                                                right: 10,
                                                                left: 0,
                                                                bottom: 5,
                                                            }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis
                                                                type="number"
                                                                allowDecimals={false}
                                                                domain={[0, "dataMax"]}
                                                            />
                                                            <YAxis
                                                                type="category"
                                                                dataKey="name"
                                                                width={80}
                                                            />
                                                            <Tooltip />
                                                            <Bar dataKey="count" name="Participants">
                                                                {stateBarData.map((entry, index) => (
                                                                    <Cell
                                                                        key={entry.name}
                                                                        fill={
                                                                            CHART_COLORS[
                                                                            index % CHART_COLORS.length
                                                                            ]
                                                                        }
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Participants by City */}
                                    <div className="col-md-6">
                                        <div className="border rounded-3 p-3 bg-light h-100 d-flex flex-column">
                                            <h6 className="mb-2">Participants by City</h6>
                                            {cityBarData.length === 0 ? (
                                                <p className="text-muted small mb-0">
                                                    No city data available.
                                                </p>
                                            ) : (
                                                <div
                                                    className="flex-grow-1 d-flex align-items-center"
                                                    style={{ minHeight: 300 }}
                                                >
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                        className="chart-container"
                                                    >
                                                        <BarChart
                                                            data={cityBarData}
                                                            layout="vertical"
                                                            margin={{
                                                                top: 5,
                                                                right: 10,
                                                                left: 0,
                                                                bottom: 5,
                                                            }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis
                                                                type="number"
                                                                allowDecimals={false}
                                                                domain={[0, "dataMax"]}
                                                            />
                                                            <YAxis
                                                                type="category"
                                                                dataKey="name"
                                                                width={110}
                                                            />
                                                            <Tooltip />
                                                            <Bar dataKey="count" name="Participants">
                                                                {cityBarData.map((entry, index) => (
                                                                    <Cell
                                                                        key={entry.name}
                                                                        fill={
                                                                            CHART_COLORS[
                                                                            index % CHART_COLORS.length
                                                                            ]
                                                                        }
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email domain pie */}
                                    <div className="col-md-6">
                                        <div className="border rounded-3 p-3 bg-light h-100">
                                            <h6 className="mb-2">Email Domain Breakdown</h6>
                                            {emailDomainPieData.length === 0 ? (
                                                <p className="text-muted small mb-0">
                                                    No email domain data available.
                                                </p>
                                            ) : (
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                    className="chart-container"
                                                >
                                                    <PieChart>
                                                        <Tooltip />
                                                        <Pie
                                                            data={emailDomainPieData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            outerRadius="80%"
                                                        >
                                                            {emailDomainPieData.map((entry, index) => (
                                                                <Cell
                                                                    key={entry.name}
                                                                    fill={
                                                                        CHART_COLORS[
                                                                        index % CHART_COLORS.length
                                                                        ]
                                                                    }
                                                                />
                                                            ))}
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Connections */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="card-title mb-0">Connections Overview</h5>
                                    <span className="badge bg-secondary">
                                        Participants with connections:{" "}
                                        {metrics.participantsWithConnections}
                                    </span>
                                </div>
                                <div className="row g-3">
                                    {/* Connection types */}
                                    <div className="col-md-6">
                                        <div className="border rounded-3 p-3 bg-light h-100 d-flex flex-column">
                                            <h6 className="mb-2">Connection Types</h6>
                                            {connectionTypeBarData.length === 0 ? (
                                                <p className="text-muted small mb-0">
                                                    No connection data available.
                                                </p>
                                            ) : (
                                                <div
                                                    className="flex-grow-1 d-flex align-items-center"
                                                    style={{ minHeight: 300 }}
                                                >
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                        className="chart-container"
                                                    >
                                                        <BarChart
                                                            data={connectionTypeBarData}
                                                            layout="vertical"
                                                            margin={{
                                                                top: 5,
                                                                right: 10,
                                                                left: 0,
                                                                bottom: 5,
                                                            }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis
                                                                type="number"
                                                                allowDecimals={false}
                                                                domain={[0, "dataMax"]}
                                                            />
                                                            <YAxis
                                                                type="category"
                                                                dataKey="name"
                                                                width={140}
                                                            />
                                                            <Tooltip />
                                                            <Bar dataKey="count" name="Connections">
                                                                {connectionTypeBarData.map((entry, index) => (
                                                                    <Cell
                                                                        key={entry.name}
                                                                        fill={
                                                                            CHART_COLORS[
                                                                            index % CHART_COLORS.length
                                                                            ]
                                                                        }
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Connected organizations */}
                                    <div className="col-md-6">
                                        <div className="border rounded-3 p-3 bg-light h-100">
                                            <h6 className="mb-2">Connected Organizations</h6>
                                            {connectedOrgPieData.length === 0 ? (
                                                <p className="text-muted small mb-0">
                                                    No connection organization data available.
                                                </p>
                                            ) : (
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                    className="chart-container"
                                                >
                                                    <PieChart>
                                                        <Tooltip />
                                                        <Pie
                                                            data={connectedOrgPieData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            outerRadius="80%"
                                                        >
                                                            {connectedOrgPieData.map((entry, index) => (
                                                                <Cell
                                                                    key={entry.name}
                                                                    fill={
                                                                        CHART_COLORS[
                                                                        index % CHART_COLORS.length
                                                                        ]
                                                                    }
                                                                />
                                                            ))}
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data table preview */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="card-title mb-0">Data Preview</h5>
                                </div>
                                {filteredRows.length === 0 ? (
                                    <p className="text-muted small mb-0">
                                        No data loaded yet. Select a form or upload a CSV file.
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-muted small">
                                            Showing first {Math.min(50, filteredRows.length)} of{" "}
                                            {filteredRows.length} rows
                                            {rows.length !== filteredRows.length && (
                                                <>
                                                    {" "}
                                                    (filtered from {rows.length} total by sector)
                                                </>
                                            )}
                                            .
                                        </p>
                                        <div
                                            className="table-responsive"
                                            style={{ maxHeight: 350 }}
                                        >
                                            <table className="table table-sm table-bordered table-hover mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        {Object.keys(filteredRows[0]).map((h) => {
                                                            const isLongTextCol = LONG_TEXT_COLUMNS.includes(
                                                                h.toLowerCase()
                                                            );
                                                            return (
                                                                <th
                                                                    key={h}
                                                                    className={
                                                                        isLongTextCol ? "table-cell-ellipsis" : undefined
                                                                    }
                                                                >
                                                                    {h}
                                                                </th>
                                                            );
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredRows.slice(0, 50).map((row, idx) => (
                                                        <tr key={idx}>
                                                            {Object.keys(filteredRows[0]).map((k) => (
                                                                <td
                                                                    key={k}
                                                                    className="table-cell-single-line"
                                                                >
                                                                    {formatTableCell(row[k])}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
