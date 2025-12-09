// src/DynamicForm.js
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getForm, submitForm } from "../api";
import { Country, State, City } from "country-state-city";
import "./DynamicForm.css";

const SECTOR_OPTIONS = [
    "Education",
    "Business",
    "Non-profit",
    "Government",
    "Community",
    "Other",
];

const CONNECTION_TYPES = [
    "Met for the first time",
    "Reconnected / existing relationship",
    "Shared info / resources",
    "Funding / partnership",
    "Referral / introduced",
    "Other",
];

function DynamicForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [schema, setSchema] = useState(null);
    const [values, setValues] = useState({});
    const [connections, setConnections] = useState([]);
    const [status, setStatus] = useState("");
    const [statusType, setStatusType] = useState("info");
    const [errors, setErrors] = useState({});

    // Location-related state
    const [countryIso, setCountryIso] = useState("");
    const [stateIso, setStateIso] = useState("");

    // Names of location fields in the schema (so we can write into values[])
    const [countryFieldName, setCountryFieldName] = useState(null);
    const [stateFieldName, setStateFieldName] = useState(null);
    const [cityFieldName, setCityFieldName] = useState(null);
    const [addressFieldName, setAddressFieldName] = useState(null);

    // Load schema
    useEffect(() => {
        // If no ID provided, don't try to fetch
        if (!id) {
            setStatus("No form ID provided. Please use a valid form link.");
            setStatusType("warning");
            return;
        }

        getForm(id)
            .then((f) => {
                setSchema(f);

                const allFields = [
                    ...(f.baseRequired || []),
                    ...(f.baseOptional || []),
                    ...(f.extraFields || []),
                ].filter((field) => field.name !== "connections");

                const initValues = {};
                allFields.forEach((field) => {
                    initValues[field.name] = "";
                });

                if (f.eventId) initValues.eventId = f.eventId;
                if (f.eventName) initValues.eventName = f.eventName;
                if (f.eventDate) initValues.eventDate = f.eventDate;

                setValues(initValues);

                // Detect which field names correspond to country, state, city, address
                const fixedFields = (f.baseRequired || []).filter(
                    (fld) => fld.name !== "connections"
                );

                const findFieldName = (predicate) => {
                    const field = fixedFields.find(predicate);
                    return field ? field.name : null;
                };

                setCountryFieldName(
                    findFieldName(
                        (fld) =>
                            /country/i.test(fld.name) || /country/i.test(fld.label || "")
                    )
                );
                setStateFieldName(
                    findFieldName(
                        (fld) =>
                            /state/i.test(fld.name) || /state/i.test(fld.label || "")
                    )
                );
                setCityFieldName(
                    findFieldName(
                        (fld) => /city/i.test(fld.name) || /city/i.test(fld.label || "")
                    )
                );
                setAddressFieldName(
                    findFieldName(
                        (fld) =>
                            /address/i.test(fld.name) || /address/i.test(fld.label || "")
                    )
                );
            })
            .catch(() => {
                setStatus("Form not found.");
                setStatusType("danger");
            });
    }, [id]);

    const allCountries = useMemo(() => Country.getAllCountries(), []);

    const availableStates = useMemo(() => {
        if (!countryIso) return [];
        return State.getStatesOfCountry(countryIso) || [];
    }, [countryIso]);

    const availableCities = useMemo(() => {
        if (!countryIso || !stateIso) return [];
        return City.getCitiesOfState(countryIso, stateIso) || [];
    }, [countryIso, stateIso]);

    if (!schema) {
        return (
            <div className="form-page bg-light d-flex justify-content-center align-items-center min-vh-100">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            {status ? (
                                <div className={`alert alert-${statusType}`}>
                                    <h5 className="alert-heading">
                                        {statusType === 'warning' ? '⚠️ No Form ID' : 'Form Not Found'}
                                    </h5>
                                    <p>{status}</p>
                                    {!id && (
                                        <div className="mt-3">
                                            <p className="mb-2"><strong>To use a form:</strong></p>
                                            <ol className="mb-3">
                                                <li>Go to the <a href="/admin" className="alert-link">Admin page</a></li>
                                                <li>Create or select an event form</li>
                                                <li>Copy the public form URL</li>
                                                <li>Share it with participants</li>
                                            </ol>
                                            <a href="/admin" className="btn btn-primary">
                                                Go to Admin Page
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading form...</span>
                                    </div>
                                    <p className="mt-2 text-muted">Loading form...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const baseRequired = schema.baseRequired || [];
    const baseOptional = schema.baseOptional || [];
    const extraFields = schema.extraFields || [];

    // DEBUG: Log what we received
    console.log('=== FORM PAGE DEBUG ===');
    console.log('Schema:', schema);
    console.log('baseRequired:', baseRequired);
    console.log('baseOptional:', baseOptional);
    console.log('extraFields:', extraFields);

    // Combine all fields and filter out connections
    const allFields = [...baseRequired, ...baseOptional, ...extraFields];
    console.log('allFields (before filter):', allFields);

    const fixedFields = allFields.filter((f) => f.name !== "connections");
    console.log('fixedFields (after removing connections):', fixedFields);

    const handleChange = (name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddConnection = () => {
        if (connections.length >= 5) {
            alert("You can add a maximum of 5 connections.");
            return;
        }
        setConnections((prev) => [
            ...prev,
            { organization: "", connectionType: "", notes: "" },
        ]);
    };

    const handleRemoveConnection = (index) => {
        setConnections((prev) => prev.filter((_, i) => i !== index));
    };

    const handleConnectionChange = (index, field, value) => {
        setConnections((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    // Removed unused getCountryName and getStateName helper functions

    const handleCountrySelect = (isoCode) => {
        const country = allCountries.find(c => c.isoCode === isoCode);
        const countryName = country ? country.name : "";

        setCountryIso(isoCode);
        setStateIso(""); // Clear state when country changes
        setValues((prev) => {
            const next = { ...prev };
            if (countryFieldName) next[countryFieldName] = countryName;
            // Clear state and city when country changes
            if (stateFieldName) next[stateFieldName] = "";
            if (cityFieldName) next[cityFieldName] = "";
            return next;
        });
    };

    const handleStateSelect = (isoCode) => {
        const state = availableStates.find(s => s.isoCode === isoCode);
        const stateName = state ? state.name : "";

        setStateIso(isoCode);
        setValues((prev) => {
            const next = { ...prev };
            if (stateFieldName) next[stateFieldName] = stateName;
            // Clear city when state changes
            if (cityFieldName) next[cityFieldName] = "";
            return next;
        });
    };

    const handleCitySelect = (cityName) => {
        setValues((prev) => {
            const next = { ...prev };
            if (cityFieldName) next[cityFieldName] = cityName;
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("");
        setErrors({});

        const newErrors = {};

        // Email / phone validation if those fields exist
        if ("email" in values) {
            const rawEmail = (values.email || "").trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!rawEmail) {
                newErrors.email = "Email is required.";
            } else if (!emailPattern.test(rawEmail)) {
                newErrors.email =
                    "Please enter a valid email address (for example: NAME@EXAMPLE.COM).";
            }
        }

        if ("phone" in values) {
            const rawPhone = (values.phone || "").trim();
            const phoneDigits = rawPhone.replace(/\D/g, "");
            if (!rawPhone) {
                newErrors.phone = "Phone number is required.";
            } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
                newErrors.phone =
                    "Phone number must be 7–15 digits (numbers only, no spaces or symbols).";
            }
        }

        // Sector required if present
        if ("sector" in values) {
            const sectorVal = (values.sector || "").trim();
            if (!sectorVal) {
                newErrors.sector = "Sector is required.";
            }
        }

        // Other required base fields
        baseRequired.forEach((field) => {
            if (!field.required) return;
            if (["email", "phone", "sector", "connections"].includes(field.name)) {
                return;
            }
            const val = (values[field.name] || "").trim();
            if (!val) {
                newErrors[field.name] = `${field.label} is required.`;
            }
        });

        // Required extra fields
        extraFields.forEach((field) => {
            if (!field.required) return;
            const val = (values[field.name] || "").trim();
            if (!val) {
                newErrors[field.name] = `${field.label} is required.`;
            }
        });

        // Connection validation
        let hasHalfFilled = false;
        connections.forEach((c) => {
            const org = (c.connectionOrg || "").trim();
            const type = (c.connectionType || "").trim();
            const other = (c.otherText || "").trim();
            const anyFilled = org || type || other;
            if (anyFilled && (!org || !type)) {
                hasHalfFilled = true;
            }
        });
        if (hasHalfFilled) {
            newErrors.connections =
                "For each connection you add, please fill BOTH Connection Organization and Connection Type.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setStatus(
                "Some fields need your attention. Please review the error list below."
            );
            setStatusType("danger");
            return;
        }

        // Build payload, uppercasing strings
        const cleanedValues = {};
        Object.entries(values).forEach(([key, val]) => {
            if (typeof val === "string") {
                cleanedValues[key] = val.trim().toUpperCase();
            } else {
                cleanedValues[key] = val;
            }
        });

        if (cleanedValues.phone) {
            cleanedValues.phone = cleanedValues.phone.replace(/\D/g, "");
        }

        const cleanedConnections = connections.map((conn) => {
            const out = {};
            Object.entries(conn).forEach(([k, v]) => {
                if (typeof v === "string") out[k] = v.trim().toUpperCase();
                else out[k] = v;
            });
            return out;
        });

        const payload = {
            ...cleanedValues,
            eventId: schema.eventId,
            eventName: schema.eventName
                ? schema.eventName.trim().toUpperCase()
                : undefined,
            eventDate: schema.eventDate,
            connections: cleanedConnections,
        };

        try {
            await submitForm(schema.id, payload);
            navigate("/thank-you");
        } catch (err) {
            setStatus("Submit failed. Please try again or check required fields.");
            setStatusType("danger");
        }
    };

    const errorMessages = Object.values(errors);

    // Split fixedFields into "other" and location ones so we can control order
    const isCountryField = (f) => countryFieldName && f.name === countryFieldName;
    const isStateField = (f) => stateFieldName && f.name === stateFieldName;
    const isCityField = (f) => cityFieldName && f.name === cityFieldName;
    const isAddressField = (f) =>
        addressFieldName && f.name === addressFieldName;

    const otherFixedFields = fixedFields.filter(
        (f) =>
            ![countryFieldName, stateFieldName, cityFieldName, addressFieldName].includes(
                f.name
            )
    );

    console.log('otherFixedFields (fields to render):', otherFixedFields);
    console.log('countryFieldName:', countryFieldName);
    console.log('stateFieldName:', stateFieldName);
    console.log('cityFieldName:', cityFieldName);
    console.log('addressFieldName:', addressFieldName);

    const countryField = fixedFields.find(isCountryField);
    const stateField = fixedFields.find(isStateField);
    const cityField = fixedFields.find(isCityField);
    const addressField = fixedFields.find(isAddressField);

    return (
        <div className="form-page bg-light min-vh-100 py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-7 col-lg-8 col-md-10">
                        <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-body p-4 p-md-5">
                                {/* Header */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h2 className="mb-1">
                                            {schema.title || "Participant & Connections Form"}
                                        </h2>
                                        {schema.eventName && (
                                            <p className="text-muted mb-0">
                                                For event: <strong>{schema.eventName}</strong>
                                            </p>
                                        )}
                                    </div>
                                    {(schema.eventDate || schema.eventId) && (
                                        <div className="text-end">
                                            {schema.eventDate && (
                                                <div className="badge bg-light text-dark mb-1">
                                                    {schema.eventDate}
                                                </div>
                                            )}
                                            {schema.eventId && (
                                                <div className="text-muted small">
                                                    ID: {schema.eventId}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <p className="text-muted small mb-3">
                                    Fields marked with{" "}
                                    <span className="text-danger fw-bold">*</span> are required.
                                </p>

                                {/* Global banner for status */}
                                {status && (
                                    <div className={`alert alert-${statusType} py-2`}>
                                        {status}
                                    </div>
                                )}

                                {/* Validation summary */}
                                {errorMessages.length > 0 && (
                                    <div className="alert alert-danger py-2">
                                        <strong>Please fix the following:</strong>
                                        <ul className="mb-0">
                                            {errorMessages.map((msg, idx) => (
                                                <li key={idx}>{msg}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {/* SECTION 1: Participant & Organization */}
                                    <div className="mb-4">
                                        <h5 className="mb-3">Participant &amp; Organization</h5>

                                        {/* All non-location fields first */}
                                        {otherFixedFields.map((field) => {
                                            // SECTOR select
                                            if (field.name === "sector") {
                                                const invalid = !!errors.sector;
                                                return (
                                                    <div className="mb-3" key={field.name}>
                                                        <label className="form-label">
                                                            Sector <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className={`form-select ${invalid ? "is-invalid" : ""
                                                                }`}
                                                            value={values.sector || ""}
                                                            onChange={(e) =>
                                                                handleChange("sector", e.target.value)
                                                            }
                                                        >
                                                            <option value="">Select sector</option>
                                                            {SECTOR_OPTIONS.map((opt) => (
                                                                <option key={opt} value={opt}>
                                                                    {opt}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {invalid && (
                                                            <div className="invalid-feedback">
                                                                {errors.sector}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            // default text input for everything else
                                            const invalid = !!errors[field.name];
                                            return (
                                                <div className="mb-3" key={field.name}>
                                                    <label className="form-label">
                                                        {field.label}{" "}
                                                        {field.required && (
                                                            <span className="text-danger">*</span>
                                                        )}
                                                    </label>
                                                    <input
                                                        type={field.type || "text"}
                                                        className={`form-control ${invalid ? "is-invalid" : ""
                                                            }`}
                                                        value={values[field.name] || ""}
                                                        onChange={(e) =>
                                                            handleChange(field.name, e.target.value)
                                                        }
                                                    />
                                                    {invalid && (
                                                        <div className="invalid-feedback">
                                                            {errors[field.name]}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* LOCATION BLOCK – Country → State → City → Address */}
                                        {countryField && (
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    {countryField.label}{" "}
                                                    {countryField.required && (
                                                        <span className="text-danger">*</span>
                                                    )}
                                                </label>
                                                <select
                                                    className={`form-select ${countryFieldName && errors[countryFieldName]
                                                        ? "is-invalid"
                                                        : ""
                                                        }`}
                                                    value={countryIso}
                                                    onChange={(e) => handleCountrySelect(e.target.value)}
                                                >
                                                    <option value="">Select country</option>
                                                    {allCountries.map((c) => (
                                                        <option key={c.isoCode} value={c.isoCode}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {countryFieldName && errors[countryFieldName] && (
                                                    <div className="invalid-feedback">
                                                        {errors[countryFieldName]}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {stateField && (
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    {stateField.label}{" "}
                                                    {stateField.required && (
                                                        <span className="text-danger">*</span>
                                                    )}
                                                </label>
                                                <select
                                                    className={`form-select ${stateFieldName && errors[stateFieldName]
                                                        ? "is-invalid"
                                                        : ""
                                                        }`}
                                                    value={stateIso}
                                                    onChange={(e) => handleStateSelect(e.target.value)}
                                                    disabled={!countryIso}
                                                >
                                                    <option value="">
                                                        {countryIso
                                                            ? "Select state / region"
                                                            : "Select country first"}
                                                    </option>
                                                    {availableStates.map((s) => (
                                                        <option key={s.isoCode} value={s.isoCode}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {stateFieldName && errors[stateFieldName] && (
                                                    <div className="invalid-feedback">
                                                        {errors[stateFieldName]}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {cityField && (
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    {cityField.label}{" "}
                                                    {cityField.required && (
                                                        <span className="text-danger">*</span>
                                                    )}
                                                </label>
                                                <select
                                                    className={`form-select ${cityFieldName && errors[cityFieldName]
                                                        ? "is-invalid"
                                                        : ""
                                                        }`}
                                                    value={
                                                        (cityFieldName && values[cityFieldName]) || ""
                                                    }
                                                    onChange={(e) => handleCitySelect(e.target.value)}
                                                    disabled={!stateIso}
                                                >
                                                    <option value="">
                                                        {stateIso ? "Select city" : "Select state first"}
                                                    </option>
                                                    {availableCities.map((c) => (
                                                        <option key={c.name} value={c.name}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {cityFieldName && errors[cityFieldName] && (
                                                    <div className="invalid-feedback">
                                                        {errors[cityFieldName]}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {addressField && (
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    {addressField.label}{" "}
                                                    {addressField.required && (
                                                        <span className="text-danger">*</span>
                                                    )}
                                                </label>
                                                <input
                                                    type={addressField.type || "text"}
                                                    className={`form-control ${addressFieldName && errors[addressFieldName]
                                                        ? "is-invalid"
                                                        : ""
                                                        }`}
                                                    value={
                                                        (addressFieldName && values[addressFieldName]) || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(addressField.name, e.target.value)
                                                    }
                                                />
                                                {addressFieldName && errors[addressFieldName] && (
                                                    <div className="invalid-feedback">
                                                        {errors[addressFieldName]}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* SECTION 2: Connections */}
                                    <hr className="my-4" />
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <h5 className="mb-0">Connections</h5>
                                            <span className="text-muted small">
                                                Optional · up to 5 entries
                                            </span>
                                        </div>
                                        <p className="text-muted small mb-2">
                                            Leave this section empty if you don&apos;t want to add any
                                            connections. If you start a connection row, please fill
                                            both the organization name and connection type.
                                        </p>
                                    </div>

                                    {errors.connections && (
                                        <p className="text-danger small mb-2">
                                            {errors.connections}
                                        </p>
                                    )}

                                    {connections.length === 0 && (
                                        <p className="text-muted small fst-italic mb-3">
                                            No connections added yet. Click{" "}
                                            <strong>“Add connection”</strong> to add one.
                                        </p>
                                    )}

                                    {connections.map((conn, idx) => (
                                        <div
                                            className="border rounded-3 p-3 mb-3 bg-light-subtle"
                                            key={idx}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="mb-0">Connection {idx + 1}</h6>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleRemoveConnection(idx)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">
                                                        Connection Organization
                                                    </label>
                                                    <input
                                                        className="form-control"
                                                        value={conn.connectionOrg}
                                                        onChange={(e) =>
                                                            handleConnectionChange(
                                                                idx,
                                                                "connectionOrg",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Connection Type</label>
                                                    <select
                                                        className="form-select"
                                                        value={conn.connectionType}
                                                        onChange={(e) =>
                                                            handleConnectionChange(
                                                                idx,
                                                                "connectionType",
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="">Select connection type</option>
                                                        {CONNECTION_TYPES.map((opt) => (
                                                            <option key={opt} value={opt}>
                                                                {opt}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {conn.connectionType === "Other" && (
                                                    <div className="col-12">
                                                        <label className="form-label">
                                                            Please describe the connection
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            value={conn.otherText}
                                                            onChange={(e) =>
                                                                handleConnectionChange(
                                                                    idx,
                                                                    "otherText",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {connections.length < 5 && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary mb-3"
                                            onClick={handleAddConnection}
                                        >
                                            + Add connection
                                        </button>
                                    )}

                                    {/* SECTION 3: Extra questions */}
                                    {extraFields.length > 0 && (
                                        <>
                                            <hr className="my-4" />
                                            <h5 className="mb-3">Additional Questions</h5>
                                            {extraFields.map((field) => {
                                                const invalid = !!errors[field.name];
                                                return (
                                                    <div className="mb-3" key={field.name}>
                                                        <label className="form-label">
                                                            {field.label}{" "}
                                                            {field.required && (
                                                                <span className="text-danger">*</span>
                                                            )}
                                                        </label>
                                                        <input
                                                            type={field.type || "text"}
                                                            className={`form-control ${invalid ? "is-invalid" : ""
                                                                }`}
                                                            value={values[field.name] || ""}
                                                            onChange={(e) =>
                                                                handleChange(field.name, e.target.value)
                                                            }
                                                        />
                                                        {invalid && (
                                                            <div className="invalid-feedback">
                                                                {errors[field.name]}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 mt-3 py-2"
                                    >
                                        Submit response
                                    </button>
                                </form>
                            </div>
                        </div>

                        <p className="text-center text-muted small mt-3">
                            Powered by Tutor/Mentor participation mapping
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DynamicForm;
