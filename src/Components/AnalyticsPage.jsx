import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function AnalyticsPage() {
    return (
        <div className="analytics-page" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
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
                    Analyze & Export
                </h1>
                <p style={{
                    fontSize: "18px",
                    color: "#64748b",
                    lineHeight: "1.6"
                }}>
                    Visualize your network, explore metrics, and export to Kumu or Gephi
                </p>
            </div>

            {/* Content Area - Placeholder */}
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px 60px" }}>
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
                        📊
                    </div>
                    <h3 style={{
                        fontSize: "24px",
                        color: "#0f172a",
                        marginBottom: "12px",
                        fontWeight: "600"
                    }}>
                        Analytics Dashboard Coming Soon
                    </h3>
                    <p style={{
                        fontSize: "16px",
                        color: "#64748b",
                        maxWidth: "600px",
                        margin: "0 auto 30px"
                    }}>
                        This page will feature interactive network visualization, centrality metrics, community detection, and export options to Kumu and Gephi.
                    </p>

                    {/* Feature List */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px",
                        maxWidth: "900px",
                        margin: "40px auto 0",
                        textAlign: "left"
                    }}>
                        <div style={{ padding: "20px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                            <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>🔍 Interactive Graph</h4>
                            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                                D3.js powered network visualization with zoom and pan
                            </p>
                        </div>
                        <div style={{ padding: "20px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                            <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>📈 Metrics</h4>
                            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                                Degree, betweenness, and closeness centrality
                            </p>
                        </div>
                        <div style={{ padding: "20px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                            <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>💾 Export</h4>
                            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                                Download for Kumu, Gephi, or as JSON
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div style={{ marginTop: "40px", textAlign: "left" }}>
                    <Link to="/split">
                        <button className="btn-secondary">
                            ← Previous: Process Data
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
