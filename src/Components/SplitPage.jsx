import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function SplitPage() {
    return (
        <div className="split-page" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
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
                    Process Nodes & Edges
                </h1>
                <p style={{
                    fontSize: "18px",
                    color: "#64748b",
                    lineHeight: "1.6"
                }}>
                    Automatically convert raw data into structured nodes and edges ready for network analysis
                </p>
            </div>

            {/* Content Area - Placeholder */}
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 60px" }}>
                <div style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                    padding: "60px 40px",
                    textAlign: "center"
                }}>
                    <div style={{
                        fontSize: "64px",
                        marginBottom: "20px",
                        opacity: "0.3"
                    }}>
                        🔄
                    </div>
                    <h3 style={{
                        fontSize: "24px",
                        color: "#0f172a",
                        marginBottom: "12px",
                        fontWeight: "600"
                    }}>
                        Data Processing Coming Soon
                    </h3>
                    <p style={{
                        fontSize: "16px",
                        color: "#64748b",
                        maxWidth: "500px",
                        margin: "0 auto"
                    }}>
                        This page will display data preview and allow you to split and process your uploaded files into nodes and edges.
                    </p>
                </div>

                {/* Navigation */}
                <div style={{
                    marginTop: "40px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <Link to="/form">
                        <button className="btn-secondary">
                            ← Previous: Collect Data
                        </button>
                    </Link>
                    <Link to="/analytics">
                        <button className="btn-primary">
                            Next: Analyze & Export →
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
