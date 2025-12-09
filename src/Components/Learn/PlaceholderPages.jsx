import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SharedLearnPages.css';
import authService from '../../services/authService';

// Export Guide Page
export function ExportGuide() {
    return (
        <div className="shared-learn-page">
            <header className="page-header">
                <div className="breadcrumb">
                    <Link to="/learn/nodes-edges">← Nodes & Edges</Link>
                </div>
                <h1> Export to Kumu & Gephi</h1>
                <p className="page-subtitle">
                    Get your network data ready for visualization
                </p>
            </header>

            {/* Overview */}
            <section className="content-section">
                <div className="info-box primary">
                    <h3>You've Collected Data. Now What?</h3>
                    <p>
                        After your event, you have responses stored in the system. The next step is to <strong>export</strong> them
                        as CSV files that Kumu or Gephi can read to create beautiful visualizations.
                    </p>
                </div>
            </section>

            {/* Export Process */}
            <section className="content-section">
                <h2>📋 The Export Process</h2>

                <div className="process-steps">
                    <div className="process-step">
                        <div className="step-num">1</div>
                        <div className="step-content">
                            <h4>Go to Upload Panel</h4>
                            <p>Navigate to the Upload/Split page from your dashboard</p>
                        </div>
                    </div>

                    <div className="process-step">
                        <div className="step-num">2</div>
                        <div className="step-content">
                            <h4>Select Your Form</h4>
                            <p>Choose which event form you want to export data from</p>
                        </div>
                    </div>

                    <div className="process-step">
                        <div className="step-num">3</div>
                        <div className="step-content">
                            <h4>Convert to Network Data</h4>
                            <p>System automatically creates <code>nodes.csv</code> and <code>edges.csv</code></p>
                        </div>
                    </div>

                    <div className="process-step">
                        <div className="step-num">4</div>
                        <div className="step-content">
                            <h4>Download Files</h4>
                            <p>Click "Download for Kumu" or "Download for Gephi"</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What You Get */}
            <section className="content-section">
                <h2>📦 What Files You Get</h2>

                <div className="file-grid">
                    <div className="file-card">
                        <div className="file-icon">📄</div>
                        <h4>nodes.csv</h4>
                        <p className="file-desc">Contains all people who filled the form</p>
                        <div className="file-sample">
                            <div className="sample-header">Sample Contents:</div>
                            <pre>Name,Email,Organization,Sector
                                Alice,alice@example.com,Tech Corp,Business
                                Bob,bob@example.com,Design Studio,Education</pre>
                        </div>
                    </div>

                    <div className="file-card">
                        <div className="file-icon">📄</div>
                        <h4>edges.csv</h4>
                        <p className="file-desc">Contains all connections between people</p>
                        <div className="file-sample">
                            <div className="sample-header">Sample Contents:</div>
                            <pre>From,To,Connection Type
                                Alice,Bob,Met for the first time
                                Alice,Carol,Reconnected</pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Guides */}
            <section className="content-section">
                <h2> Import to Visualization Tools</h2>

                <div className="platform-tabs">
                    <div className="platform-card kumu">
                        <div className="platform-header">
                            <h3>Kumu (Web-based)</h3>
                            <span className="platform-badge">Recommended for Sharing</span>
                        </div>
                        <div className="platform-steps">
                            <ol>
                                <li>Go to <a href="https://kumu.io" target="_blank" rel="noopener noreferrer">kumu.io</a> and create a free account</li>
                                <li>Click "New Project" → "Import Spreadsheet"</li>
                                <li>Upload <code>nodes.csv</code> first, then <code>edges.csv</code></li>
                                <li>Kumu automatically creates your network visualization</li>
                                <li>Customize colors, layout, and labels</li>
                                <li>Share via public link</li>
                            </ol>
                            <div className="platform-pros">
                                <strong>Best for:</strong> Quick visualization, sharing with stakeholders, web embedding
                            </div>
                        </div>
                    </div>

                    <div className="platform-card gephi">
                        <div className="platform-header">
                            <h3>Gephi (Desktop)</h3>
                            <span className="platform-badge">Recommended for Analysis</span>
                        </div>
                        <div className="platform-steps">
                            <ol>
                                <li>Download Gephi from <a href="https://gephi.org" target="_blank" rel="noopener noreferrer">gephi.org</a> (free)</li>
                                <li>Open Gephi → File → Import Spreadsheet</li>
                                <li>Import <code>nodes.csv</code> as "Nodes table"</li>
                                <li>Import <code>edges.csv</code> as "Edges table"</li>
                                <li>Run layout algorithms (ForceAtlas2, etc.)</li>
                                <li>Export as image/PDF for publications</li>
                            </ol>
                            <div className="platform-pros">
                                <strong>Best for:</strong> Complex analysis, large networks, publication-quality graphics
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Troubleshooting */}
            <section className="content-section">
                <h2>🔧 Troubleshooting</h2>

                <div className="faq-list">
                    <div className="faq-item">
                        <h4> "CSV file won't import"</h4>
                        <p>Make sure you're importing nodes BEFORE edges. Always import nodes first.</p>
                    </div>

                    <div className="faq-item">
                        <h4> "Some connections are missing"</h4>
                        <p>Check that both people in the connection filled out the form. Edges only appear if both nodes exist.</p>
                    </div>

                    <div className="faq-item">
                        <h4> "Network looks messy"</h4>
                        <p>In Kumu/Gephi, run a layout algorithm (ForceAtlas2 or Fruchterman-Reingold) to auto-arrange nodes.</p>
                    </div>
                </div>
            </section>

            {/* Next */}
            <section className="content-section next-section">
                <h2> Continue Learning</h2>
                <div className="next-links">
                    <Link to="/learn/examples" className="next-link-card">
                        <span className="card-badge">Next</span>
                        <h4>See Real-World Examples →</h4>
                        <p>Get inspired by how others use network mapping</p>
                    </Link>
                    <Link to="/learn/faq" className="next-link-card">
                        <span className="card-badge">Help</span>
                        <h4>Frequently Asked Questions</h4>
                        <p>Common questions and answers</p>
                    </Link>
                </div>
            </section>
        </div>
    );
}

// Use Cases Page
export function UseCases() {
    const navigate = useNavigate();

    const handleCreateFormClick = () => {
        // Check if user is logged in
        if (authService.isAuthenticated()) {
            // Redirect to admin/forms page
            navigate('/admin');
        } else {
            // Redirect to signup page
            navigate('/signup');
        }
    };

    return (
        <div className="shared-learn-page">
            <header className="page-header">
                <h1> Real-World Use Cases</h1>
                <p className="page-subtitle">
                    See how organizations use network mapping for events and research
                </p>
            </header>

            {/* Use Case 1 */}
            <section className="content-section">
                <div className="use-case-card">
                    <div className="use-case-header">
                        <h3>🎓 Academic Conference Networking</h3>
                        <span className="case-badge">Research</span>
                    </div>
                    <div className="use-case-body">
                        <p className="use-case-scenario">
                            <strong>Scenario:</strong> A 3-day AI conference with 500 attendees from 50 universities
                        </p>

                        <h4>Form Design:</h4>
                        <ul>
                            <li>Researcher name, institution, research area</li>
                            <li>"Who did you meet during the conference?"</li>
                            <li>"Who shares your research interests?"</li>
                        </ul>

                        <h4>Network Insights:</h4>
                        <ul>
                            <li>Identified 3 research clusters (NLP, Computer Vision, Robotics)</li>
                            <li>Found influential researchers connecting multiple groups</li>
                            <li>Discovered collaboration opportunities between institutions</li>
                        </ul>

                        <div className="use-case-result">
                            <strong>Result:</strong> 85% of attendees filled the form, leading to 12 new research collaborations
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Case 2 */}
            <section className="content-section">
                <div className="use-case-card">
                    <div className="use-case-header">
                        <h3> Corporate Team Building Event</h3>
                        <span className="case-badge">Business</span>
                    </div>
                    <div className="use-case-body">
                        <p className="use-case-scenario">
                            <strong>Scenario:</strong> Company retreat with 200 employees from 5 departments
                        </p>

                        <h4>Form Design:</h4>
                        <ul>
                            <li>Employee name, department, role</li>
                            <li>"Which departments did you interact with?"</li>
                            <li>"Who did you collaborate with on projects?"</li>
                        </ul>

                        <h4>Network Insights:</h4>
                        <ul>
                            <li>Revealed siloed departments with few cross-team connections</li>
                            <li>Identified bridge employees who connect multiple teams</li>
                            <li>Highlighted opportunities for better cross-department communication</li>
                        </ul>

                        <div className="use-case-result">
                            <strong>Result:</strong> HR used insights to redesign seating and project assignments
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Case 3 */}
            <section className="content-section">
                <div className="use-case-card">
                    <div className="use-case-header">
                        <h3>🌍 Community Organization Mapping</h3>
                        <span className="case-badge">Non-profit</span>
                    </div>
                    <div className="use-case-body">
                        <p className="use-case-scenario">
                            <strong>Scenario:</strong> Mapping connections among 50 local non-profits
                        </p>

                        <h4>Form Design:</h4>
                        <ul>
                            <li>Organization name, focus area, location</li>
                            <li>"Which organizations do you partner with?"</li>
                            <li>"What resources do you share?"</li>
                        </ul>

                        <h4>Network Insights:</h4>
                        <ul>
                            <li>Discovered 3 organizations serving as resource hubs</li>
                            <li>Found gaps in service coverage by neighborhood</li>
                            <li>Identified potential new partnerships</li>
                        </ul>

                        <div className="use-case-result">
                            <strong>Result:</strong> Led to creation of 5 new inter-organizational programs
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Takeaways */}
            <section className="content-section">
                <h2> Key Lessons from These Cases</h2>

                <div className="takeaways-grid">
                    <div className="takeaway-card">
                        <h4>Keep Forms Simple</h4>
                        <p>All successful cases used 8-12 questions max. Higher completion rates = better network data.</p>
                    </div>

                    <div className="takeaway-card">
                        <h4>Ask the Right Connection Questions</h4>
                        <p>Specific questions ("Who did you collaborate with?") work better than vague ones ("List your connections").</p>
                    </div>

                    <div className="takeaway-card">
                        <h4>Share Forms Early</h4>
                        <p>Distribute forms before, during, AND after events for maximum participation.</p>
                    </div>

                    <div className="takeaway-card">
                        <h4>Visualize to Communicate</h4>
                        <p>Network graphs make insights obvious to stakeholders. A picture is worth 1000 spreadsheet rows.</p>
                    </div>
                </div>
            </section>

            {/* Next */}
            <section className="content-section next-section">
                <h2> Ready to Start?</h2>
                <div className="next-links">
                    <div onClick={handleCreateFormClick} className="next-link-card" style={{ cursor: 'pointer' }}>
                        <h4>Create Your First Form</h4>
                        <p>Start collecting network data for your event</p>
                        <span className="arrow">→</span>
                    </div>
                </div>
            </section>
        </div>
    );
}

// FAQ Page
export function FAQ() {
    return (
        <div className="shared-learn-page">
            <header className="page-header">
                <h1> Frequently Asked Questions</h1>
                <p className="page-subtitle">
                    Common questions about network data collection and visualization
                </p>
            </header>

            {/* General */}
            <section className="content-section">
                <h2> General Questions</h2>

                <div className="faq-list">
                    <div className="faq-item">
                        <h4>What does this tool do?</h4>
                        <p>
                            This tool helps you <strong>collect network data</strong> from events, conferences, or organizations through custom forms.
                            It converts form responses into <code>nodes.csv</code> and <code>edges.csv</code> files that you can upload to
                            visualization tools like Kumu or Gephi.
                        </p>
                    </div>

                    <div className="faq-item">
                        <h4>Does this tool create network visualizations?</h4>
                        <p>
                            No. This tool focuses on <strong>data collection and export</strong>. For visualization, you'll use external tools like:
                        </p>
                        <ul>
                            <li><strong>Kumu</strong> - Web-based, great for sharing</li>
                            <li><strong>Gephi</strong> - Desktop app, best for in-depth analysis</li>
                        </ul>
                    </div>

                    <div className="faq-item">
                        <h4>Is this tool free to use?</h4>
                        <p>
                            The tool is open-source. You can deploy it yourself or contact the maintainers for hosted options.
                        </p>
                    </div>
                </div>
            </section>

            {/* Form Design */}
            <section className="content-section">
                <h2> Form Design Questions</h2>

                <div className="faq-list">
                    <div className="faq-item">
                        <h4>What fields should I include in my form?</h4>
                        <p>
                            You have complete flexibility! At minimum, include:
                        </p>
                        <ul>
                            <li>1 identity field (name or email)</li>
                            <li>2-3 attribute fields (organization, role, etc.)</li>
                            <li>1 connection question ("Who did you meet?")</li>
                        </ul>
                    </div>

                    <div className="faq-item">
                        <h4>How many questions is too many?</h4>
                        <p>
                            Aim for 8-15 questions. More than that and completion rates drop significantly. Focus on essentials.
                        </p>
                    </div>

                    <div className="faq-item">
                        <h4>Can I track different types of relationships?</h4>
                        <p>
                            Yes! Add multiple connection questions:
                        </p>
                        <ul>
                            <li>"Who did you meet?" (creates one edge type)</li>
                            <li>"Who did you collaborate with?" (creates another edge type)</li>
                        </ul>
                        <p>Each becomes a different relationship in your network.</p>
                    </div>
                </div>
            </section>

            {/* Technical */}
            <section className="content-section">
                <h2>🔧 Technical Questions</h2>

                <div className="faq-list">
                    <div className="faq-item">
                        <h4>How many responses can the system handle?</h4>
                        <p>
                            The system can handle thousands of responses. Export performance may vary with very large datasets (10,000+ nodes).
                        </p>
                    </div>

                    <div className="faq-item">
                        <h4>What if someone doesn't fill out the connection field?</h4>
                        <p>
                            They'll still appear as a node in the network, just without any edges (connections). This is fine - not everyone knows everyone!
                        </p>
                    </div>

                    <div className="faq-item">
                        <h4>Can I edit responses after submission?</h4>
                        <p>
                            Currently, responses are final once submitted. Plan to collect data carefully and consider a test run before your main event.
                        </p>
                    </div>
                </div>
            </section>

            {/* Export & Visualization */}
            <section className="content-section">
                <h2> Export & Visualization</h2>

                <div className="faq-list">
                    <div className="faq-item">
                        <h4>Which is better: Kumu or Gephi?</h4>
                        <p>
                            Depends on your needs:
                        </p>
                        <ul>
                            <li><strong>Kumu:</strong> Great for quick visualization and sharing with others via web link</li>
                            <li><strong>Gephi:</strong> Better for in-depth analysis and publication-quality graphics</li>
                        </ul>
                        <p>Try both! The CSV files work with either tool.</p>
                    </div>

                    <div className="faq-item">
                        <h4>Why are some connections missing in my visualization?</h4>
                        <p>
                            Edges only appear if BOTH people filled out the form. If Alice mentions Bob but Bob didn't respond, that connection won't show.
                        </p>
                    </div>

                    <div className="faq-item">
                        <h4>Can I re-export data after adding more responses?</h4>
                        <p>
                            Yes! Export anytime. The system generates fresh CSV files with all current responses each time you export.
                        </p>
                    </div>
                </div>
            </section>

            {/* Still Have Questions? */}
            <section className="content-section">
                <div className="info-box primary">
                    <h3>Still Have Questions?</h3>
                    <p>
                        Check out our other learning resources or consult the documentation for your visualization tool (Kumu or Gephi).
                    </p>
                    <div style={{ marginTop: '1rem' }}>
                        <Link to="/learn/getting-started" className="btn-primary-learn">
                            Back to Getting Started
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
