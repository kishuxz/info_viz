import React from "react";
import { Link } from "react-router-dom";
import UploadPanel from "./UploadPanel";
import "./HomePage.css";

export default function FormPage() {
    return (
        <div className="form-page" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            {/* Navigation */}
            <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
                <Link to="/" style={{
                    textDecoration: "none",
                    color: "#3b82f6",
                    fontSize: "14px",
                    fontWeight: "500"
                }}>
                    ← Back to Home
                </Link>
            </div>

            {/* Header */}
            <div style={{
                textAlign: "center",
                padding: "60px 20px 40px",
                maxWidth: "800px",
                margin: "0 auto"
            }}>
                <h1 style={{
                    fontSize: "48px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "16px"
                }}>
                    Collect Data
                </h1>
                <p style={{
                    fontSize: "18px",
                    color: "#64748b",
                    lineHeight: "1.6"
                }}>
                    Upload your Google Forms or Excel files to get started with network mapping
                </p>
            </div>

            {/* Upload Panel */}
            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px 60px" }}>
                <div style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                    padding: "40px"
                }}>
                    <UploadPanel />
                </div>

                {/* Navigation to next step */}
                <div style={{ marginTop: "40px", textAlign: "center" }}>
                    <Link to="/split">
                        <button className="btn-primary" style={{ padding: "12px 32px" }}>
                            Next: Process Data →
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
