// src/AdminPage.js
import React, { useState, useEffect } from "react";
import {
  saveForm,
  getForm,
  getResponses,
  getFormsForAdmin,
  deleteForm,
} from "../api";
import AdminOnlyMessage from "./AdminOnlyMessage";

// Core participant fields that EVERY form has
const baseRequired = [
  { name: "orgName", label: "Organization Name", type: "text", required: true },
  { name: "sector", label: "Sector", type: "text", required: true },

  { name: "firstName", label: "First Name", type: "text", required: true },
  { name: "lastName", label: "Last Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "socialLink",
    label: "Social Media Link to Connect",
    type: "text",
    required: true,
  },
  { name: "phone", label: "Phone Number", type: "text", required: true },
  {
    name: "addressStreet",
    label: "Street Address",
    type: "text",
    required: true,
  },
  { name: "addressCity", label: "City", type: "text", required: true },
  { name: "addressState", label: "State", type: "text", required: true },
  { name: "addressCountry", label: "Country", type: "text", required: true },

  // special field – rendered as a dedicated connections section in DynamicForm
  { name: "connections", label: "Connections", type: "connections", required: true },
];

// kept for compatibility with backend schema
const baseOptional = [];

// Handle both array and {forms:[...]} or {items:[...]} shapes
const normalizeFormsResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.forms)) return data.forms;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

const MAX_PREVIEW_CELL_CHARS = 80;

const formatPreviewCell = (value, maxChars = MAX_PREVIEW_CELL_CHARS) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.length <= maxChars) return str;
  return str.slice(0, maxChars) + "...";
};

function FormBuilderPage() {
  const storedAdminId = localStorage.getItem("adminId") || "";
  const storedAdminName = localStorage.getItem("adminName") || "";
  const [adminId] = useState(storedAdminId);

  // event details for this form (eventId is also the form UID)
  const [eventId, setEventId] = useState(() => `EVT-${Date.now()}`);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");

  const [extraFields, setExtraFields] = useState([]);
  const [newField, setNewField] = useState({
    label: "",
    name: "",
    type: "text",
    required: false,
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const [previewRows, setPreviewRows] = useState([]);
  const [adminForms, setAdminForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [hasSaved, setHasSaved] = useState(false); // track whether this form exists

  useEffect(() => {
    if (!adminId) return;

    getFormsForAdmin(adminId)
      .then((data) => {
        const formsArray = normalizeFormsResponse(data);
        setAdminForms(formsArray);
        console.log("Loaded admin forms:", formsArray);
      })
      .catch((err) => {
        console.error("Error loading admin forms:", err);
        setAdminForms([]);
      });
  }, [adminId]);

  const resetExtraFieldEditor = () => {
    setEditingIndex(null);
    setNewField({ label: "", name: "", type: "text", required: false });
  };

  const handleSelectForm = async (id) => {
    setPreviewRows([]);
    setAlertMsg("");
    resetExtraFieldEditor();
    try {
      const f = await getForm(id);
      setExtraFields(f.extraFields || []);
      setEventId(f.eventId || f.id || `EVT-${Date.now()}`);
      setEventName(f.eventName || "");
      setEventDate(f.eventDate || "");
      setHasSaved(true); // existing form is already saved
    } catch (err) {
      console.error("Error loading form:", err);
      setExtraFields([]);
      setEventId(`EVT-${Date.now()}`);
      setEventName("");
      setEventDate("");
      setHasSaved(false);
    }
  };

  const handleNewForm = () => {
    setPreviewRows([]);
    setAlertMsg("");
    resetExtraFieldEditor();
    setExtraFields([]);
    setEventId(`EVT-${Date.now()}`); // new UID
    setEventName("");
    setEventDate("");
    setHasSaved(false); // new, not yet saved
  };

  // ADD / UPDATE extra field
  const handleSaveField = () => {
    if (!newField.label.trim() || !newField.name.trim()) return;

    const cleanField = {
      ...newField,
      label: newField.label.trim(),
      name: newField.name.trim(),
    };

    if (editingIndex === null) {
      setExtraFields([...extraFields, cleanField]);
    } else {
      const updated = extraFields.map((f, idx) =>
        idx === editingIndex ? cleanField : f
      );
      setExtraFields(updated);
    }

    resetExtraFieldEditor();
  };

  const handleEditField = (index) => {
    const field = extraFields[index];
    setEditingIndex(index);
    setNewField({
      label: field.label || "",
      name: field.name || "",
      type: field.type || "text",
      required: !!field.required,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteField = (index) => {
    const updated = extraFields.filter((_, idx) => idx !== index);
    setExtraFields(updated);

    if (editingIndex === index) {
      resetExtraFieldEditor();
    }
  };

  const handleSaveForm = async () => {
    console.log('=== SAVE FORM CLICKED ===');
    console.log('adminId:', adminId);
    console.log('eventName:', eventName);
    console.log('eventDate:', eventDate);

    if (!adminId) {
      console.log('ERROR: No adminId');
      setAlertMsg("You must be logged in as an admin to save forms.");
      setAlertType("warning");
      return;
    }
    if (!eventName || !eventDate) {
      console.log('ERROR: Missing eventName or eventDate');
      setAlertMsg("Please enter Event Name and Date of Event.");
      setAlertType("warning");
      return;
    }

    const title =
      eventName && eventName.trim().length > 0
        ? eventName.trim()
        : "Participant & Connections Form";

    const form = {
      id: eventId,
      adminId,
      title,
      baseRequired,
      baseOptional,
      extraFields,
      eventId,
      eventName,
      eventDate,
    };

    console.log('Form data to save:', form);
    console.log('Auth token:', localStorage.getItem('authToken'));

    try {
      console.log('Calling saveForm API...');
      const result = await saveForm(form);
      console.log('Save form result:', result);

      setAlertMsg("Form saved successfully.");
      setAlertType("success");
      setHasSaved(true);

      console.log('Fetching updated forms list...');
      const data = await getFormsForAdmin(adminId);
      console.log('Forms data received:', data);

      const formsArray = normalizeFormsResponse(data);
      setAdminForms(formsArray);
      console.log("Refreshed admin forms:", formsArray);
    } catch (err) {
      console.error("FULL Error saving form:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);
      setAlertMsg(err.message || "Error saving form.");
      setAlertType("danger");
    }
  };

  const handleDeleteForm = async (formId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this form?\n\nThis will permanently delete the form and ALL associated responses."
    );
    if (!confirmed) return;

    try {
      await deleteForm(formId);

      const data = await getFormsForAdmin(adminId);
      const formsArray = normalizeFormsResponse(data);
      setAdminForms(formsArray);

      if (eventId === formId) {
        handleNewForm();
      }

      setAlertMsg("Form deleted successfully.");
      setAlertType("success");
    } catch (err) {
      console.error("Error deleting form:", err);
      setAlertMsg(err.message || "Error deleting form.");
      setAlertType("danger");
    }
  };

  const handleLoadPreview = async () => {
    if (!eventId) return;
    const data = await getResponses(eventId);
    setPreviewRows(data.rows || []);
  };

  const handleDownload = () => {
    if (!eventId) return;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    window.location.href = `${apiUrl}/api/forms/${eventId}/export`;
  };

  const currentFormUrl = eventId
    ? `${window.location.origin}/form/${eventId}`
    : "";

  if (!adminId) {
    return <AdminOnlyMessage />;
  }

  // Filter forms by search term (eventName/title)
  const filteredForms = adminForms.filter((f) => {
    const label = (f.title || f.eventName || f.id || "").toLowerCase();
    return label.includes(searchTerm.toLowerCase());
  });

  // currently unused but kept (no functionality change)
  const totalForms = adminForms.length;
  const totalExtraFields = extraFields.length;
  const totalPreviewRows = previewRows.length;

  return (
    <div className="analytics-dashboard admin-page">
      {/* Shared gradient hero with analytics page */}
      <div className="analytics-hero px-4 px-md-5 py-4">
        <div className="container d-flex justify-content-between align-items-start">
          <div>
            <div className="analytics-hero-kicker mb-2">
              FORM BUILDER · ADMIN WORKSPACE
            </div>
            <h1 className="analytics-hero-title mb-1">
              Hi {storedAdminName || storedAdminId},{" "}
              <span>let&apos;s design your event forms.</span>
            </h1>
            <p className="analytics-hero-subtitle mb-0">
              Create forms, add extra questions, and monitor responses in one
              place.
            </p>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-2 align-items-sm-end">
            <button
              type="button"
              className="btn btn-light analytics-hero-cta text-primary fw-semibold mt-2 mt-sm-0"
              onClick={handleNewForm}
            >
              + New Form
            </button>
          </div>
        </div>
      </div>

      {/* Main body – matches Analytics layout */}
      <div className="container analytics-body my-4">
        <div className="row g-4">
          {/* LEFT: FORMS LIST PANEL */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Your Event Forms</h5>
                  <span className="badge bg-primary-subtle text-primary small px-3 py-2 rounded-pill">
                    {storedAdminName || storedAdminId}
                  </span>
                </div>
                <p className="text-muted small mb-3">
                  Select a form to edit its fields or preview its responses.
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

                {filteredForms.length === 0 ? (
                  <p className="text-muted small mb-0">
                    No forms yet. Click <strong>+ New Form</strong> to create
                    your first one.
                  </p>
                ) : (
                  <div
                    className="mt-1 pe-2"
                    style={{
                      maxHeight: "300px", // Reduced to show scroll with 3-4 forms
                      overflowY: "auto",
                      overflowX: "hidden",
                      scrollbarWidth: "thin", // For Firefox
                      scrollbarColor: "#667eea #f0f0f0", // For Firefox
                    }}
                  >
                    {filteredForms.map((f) => {
                      const isActive = f.id === eventId;
                      const title = f.title || f.eventName || "Untitled event";
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
                          onClick={() => handleSelectForm(f.id)}
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

                          {/* Delete button */}
                          <button
                            type="button"
                            className={`btn btn-sm border-0 position-absolute bottom-0 end-0 m-2 rounded-circle ${isActive ? "text-white-50" : "text-muted"
                              }`}
                            title="Delete form"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteForm(f.id);
                            }}
                          >
                            🗑
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: BUILDER + PREVIEW */}
          <div className="col-lg-8">
            {/* BUILDER CARD */}
            <div className="card shadow-sm border-0 mb-4 rounded-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <h5 className="card-title mb-0">Form Designer</h5>
                    <small className="text-muted">
                      Configure event details, built-in fields, and your own
                      extra questions.
                    </small>
                  </div>
                  {hasSaved && (
                    <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill small">
                      Saved
                    </span>
                  )}
                </div>

                {alertMsg && (
                  <div className={`alert alert-${alertType} py-2 mt-3 mb-3`}>
                    {alertMsg}
                  </div>
                )}

                {/* EVENT DETAILS */}
                <section className="mb-4 mt-3">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary rounded-pill me-2">
                      1
                    </span>
                    <h6 className="mb-0">Event Details</h6>
                  </div>
                  <p className="text-muted small mb-3">
                    Basic information used in analytics dashboards and the
                    public form header.
                  </p>
                  <div className="border rounded-4 p-3 bg-light">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Event UID
                        </label>
                        <input
                          className="form-control"
                          value={eventId}
                          readOnly
                        />
                        <div className="form-text">
                          Auto-generated unique ID used in the public URL.
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Event Name
                        </label>
                        <input
                          className="form-control"
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                          placeholder="e.g., Tutor/Mentor Conference 2025"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Date of Event
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Public URL + open button */}
                  <div className="mt-3">
                    {hasSaved ? (
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <small className="text-muted">
                          Public form URL: <code>{currentFormUrl}</code>
                        </small>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => window.open(currentFormUrl, "_blank")}
                        >
                          Open Public Form
                        </button>
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">
                        Save this form to generate a public URL and enable the{" "}
                        <strong>Open Public Form</strong> button.
                      </p>
                    )}
                  </div>
                </section>

                <hr />

                {/* FIXED FIELDS */}
                <section className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary rounded-pill me-2">
                      2
                    </span>
                    <h6 className="mb-0">Participant Fields</h6>
                    <span className="badge bg-light text-muted border ms-2 small">
                      Fixed &amp; required
                    </span>
                  </div>
                  <p className="text-muted small mb-3">
                    These core fields are always collected and cannot be
                    removed.
                  </p>
                  <div className="border rounded-4 p-3 bg-light">
                    <ul className="list-unstyled mb-3">
                      {baseRequired
                        .filter((f) => f.name !== "connections")
                        .map((f) => (
                          <li className="mb-1" key={f.name}>
                            <span className="me-1">•</span>
                            {f.label} <span className="text-danger">*</span>
                          </li>
                        ))}
                    </ul>
                    <div className="pt-2 border-top">
                      <strong>Connections</strong>{" "}
                      <span className="text-danger">*</span>
                      <p className="text-muted small mb-0">
                        For each participant you can record up to five
                        organization connections (organization, connection type,
                        and optional notes). This appears as a dedicated section
                        on the public form.
                      </p>
                    </div>
                  </div>
                </section>

                <hr />

                {/* EXTRA FIELDS */}
                <section className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary rounded-pill me-2">
                      3
                    </span>
                    <h6 className="mb-0">Extra Fields</h6>
                    <span className="badge bg-secondary-subtle text-secondary ms-2 small">
                      Admin-defined
                    </span>
                  </div>
                  <p className="text-muted small mb-3">
                    Add additional questions that appear after the fixed fields
                    on the public form.
                  </p>

                  {/* Editor for add / edit extra field */}
                  <div className="border rounded-4 p-3 bg-light mb-3">
                    <div className="row g-2 align-items-end">
                      <div className="col-md-4">
                        <label className="form-label">Label</label>
                        <input
                          className="form-control"
                          placeholder="e.g., Role"
                          value={newField.label}
                          onChange={(e) =>
                            setNewField({
                              ...newField,
                              label: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Name (key)</label>
                        <input
                          className="form-control"
                          placeholder="role"
                          value={newField.name}
                          onChange={(e) =>
                            setNewField({
                              ...newField,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Type</label>
                        <select
                          className="form-select"
                          value={newField.type}
                          onChange={(e) =>
                            setNewField({
                              ...newField,
                              type: e.target.value,
                            })
                          }
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                        </select>
                      </div>
                      <div className="col-md-1 form-check mt-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="extraRequired"
                          checked={newField.required}
                          onChange={(e) =>
                            setNewField({
                              ...newField,
                              required: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="extraRequired"
                        >
                          Required
                        </label>
                      </div>
                      <div className="col-md-1 text-end mt-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-success me-1"
                          onClick={handleSaveField}
                        >
                          {editingIndex === null ? "Add" : "Save"}
                        </button>
                        {editingIndex !== null && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={resetExtraFieldEditor}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {extraFields.length > 0 && (
                    <div className="table-responsive mb-2">
                      <table className="table table-sm table-bordered table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Label</th>
                            <th>Key</th>
                            <th>Type</th>
                            <th>Required</th>
                            <th style={{ width: "150px" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extraFields.map((f, idx) => (
                            <tr key={idx}>
                              <td>{f.label}</td>
                              <td>
                                <code className="small">{f.name}</code>
                              </td>
                              <td>{f.type}</td>
                              <td>
                                {f.required ? (
                                  <span className="badge bg-danger">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary">
                                    No
                                  </span>
                                )}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleEditField(idx)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteField(idx)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-primary px-4"
                    type="button"
                    onClick={handleSaveForm}
                  >
                    Save Form
                  </button>
                </div>
              </div>
            </div>

            {/* RESPONSES PREVIEW CARD */}
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h5 className="card-title mb-0">Responses Preview</h5>
                    <small className="text-muted">
                      Quick peek at live submissions. Full data is available in
                      the CSV export and analytics page.
                    </small>
                  </div>
                  <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill small">
                    {previewRows.length} rows
                  </span>
                </div>

                <div className="mb-3">
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={handleLoadPreview}
                    disabled={!eventId}
                  >
                    Load Preview
                  </button>
                  <button
                    className="btn btn-outline-success"
                    onClick={handleDownload}
                    disabled={!eventId}
                  >
                    Download CSV
                  </button>
                </div>

                {previewRows.length > 0 ? (
                  <div className="table-responsive" style={{ maxHeight: 320 }}>
                    <table className="table table-sm table-bordered table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          {Object.keys(previewRows[0]).map((h) => (
                            <th key={h} className="table-cell-single-line">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i}>
                            {Object.keys(row).map((k) => (
                              <td key={k} className="table-cell-single-line">
                                {formatPreviewCell(row[k])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border rounded-3 bg-light p-4 text-center">
                    <div className="mb-2" style={{ fontSize: 32 }}>
                      📥
                    </div>
                    <p className="mb-1 fw-semibold">No responses yet</p>
                    <p className="text-muted small mb-0">
                      Share the public form link with participants. As soon as
                      submissions arrive, a live snapshot will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormBuilderPage;
