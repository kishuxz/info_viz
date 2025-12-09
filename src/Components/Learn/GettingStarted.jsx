import React from 'react';
import { Link } from 'react-router-dom';
import './GettingStarted.css';

export default function GettingStarted() {
    return (
        <div className="getting-started-page">
            {/* Hero Section */}
            <header className="learn-hero">
                <div className="hero-badge">Start Here</div>
                <h1>From Event to Network in 3 Steps</h1>
                <p className="hero-subtitle">
                    Learn how to collect network data from events and visualize connections in Kumu or Gephi
                </p>

                <div className="workflow-steps">
                    <div className="workflow-step">
                        <div className="step-number">1</div>
                        <h3>Create Form</h3>
                        <p>Design questions</p>
                    </div>
                    <div className="workflow-arrow">→</div>
                    <div className="workflow-step">
                        <div className="step-number">2</div>
                        <h3>Collect Data</h3>
                        <p>Share public URL</p>
                    </div>
                    <div className="workflow-arrow">→</div>
                    <div className="workflow-step">
                        <div className="step-number">3</div>
                        <h3>Visualize</h3>
                        <p>Export to Kumu/Gephi</p>
                    </div>
                </div>

                <div className="hero-cta">
                    <Link to="/learn/form-creation" className="btn-primary-learn">
                        Start Creating Forms
                    </Link>
                    <Link to="/learn/examples" className="btn-secondary-learn">
                        See Examples
                    </Link>
                </div>
            </header>

            {/* What This Tool Does */}
            <section className="content-section">
                <h2>What This Tool Does</h2>

                <div className="info-box primary">
                    <h3>This Tool = Data Collection for Network Graphs</h3>
                    <p>
                        Think of this tool as a <strong>smart survey platform</strong> designed specifically
                        for collecting network data from events, conferences, or organizations.
                    </p>
                </div>

                <div className="two-column-grid">
                    <div className="feature-card green">
                        <h4>What Happens Here (In This Tool)</h4>
                        <ul>
                            <li>You design a form with questions like:
                                <ul>
                                    <li>"What's your name and organization?"</li>
                                    <li>"Who did you meet at the event?"</li>
                                    <li>"Who would you like to collaborate with?"</li>
                                </ul>
                            </li>
                            <li>You get a public link: <code>yoursite.com/form/event2025</code></li>
                            <li>Attendees fill out the form (like any survey)</li>
                            <li>We automatically convert their answers into network data:
                                <ul>
                                    <li><strong>Nodes</strong>: Each person who filled the form</li>
                                    <li><strong>Edges</strong>: Connections they mentioned</li>
                                </ul>
                            </li>
                            <li>You download 2 files: <code>nodes.csv</code> and <code>edges.csv</code></li>
                        </ul>
                    </div>

                    <div className="feature-card blue">
                        <h4>What Happens Next (In Kumu or Gephi)</h4>
                        <ul>
                            <li>You upload those CSV files to Kumu or Gephi</li>
                            <li>They create the beautiful network visualization</li>
                            <li>You can customize colors, layouts, and filtering</li>
                        </ul>
                        <div className="note-box">
                            <strong>We focus on collecting data correctly. They focus on visualization.</strong>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Complete Workflow */}
            <section className="content-section workflow-section">
                <h2>The Complete Workflow</h2>

                <div className="workflow-diagram">
                    <div className="workflow-phase your-tool">
                        <div className="phase-header">
                            <h3>YOUR TOOL (NetworkMap)</h3>
                        </div>

                        <div className="workflow-item">
                            <div className="item-badge">Step 1</div>
                            <h4>Create Form</h4>
                            <p>Design questions to collect participant info and connections</p>
                            <div className="code-preview">
                                Fields: Name, Email, Organization, "Who did you meet?"
                            </div>
                        </div>

                        <div className="workflow-item">
                            <div className="item-badge">Step 2</div>
                            <h4>Share Public URL</h4>
                            <p>Share via email, QR code, SMS, or social media</p>
                            <div className="code-preview">
                                https://yoursite.com/form/abc123
                            </div>
                        </div>

                        <div className="workflow-item">
                            <div className="item-badge">Step 3</div>
                            <h4>Attendees Fill Form</h4>
                            <p>Each person enters their info + connections</p>
                            <div className="code-preview">
                                Data automatically collected in database
                            </div>
                        </div>

                        <div className="workflow-item">
                            <div className="item-badge">Step 4</div>
                            <h4>Auto-Convert to Nodes & Edges</h4>
                            <p>We transform responses into network data files</p>
                            <div className="code-preview">
                                nodes.csv: Name, Email, Organization<br />
                                edges.csv: From, To, Connection_Type
                            </div>
                        </div>

                        <div className="workflow-item">
                            <div className="item-badge">Step 5</div>
                            <h4>Download Export Files</h4>
                            <p>Get CSV files ready for visualization software</p>
                            <div className="button-preview">
                                [Download for Kumu] [Download for Gephi]
                            </div>
                        </div>
                    </div>

                    <div className="workflow-arrow-big">↓</div>

                    <div className="workflow-phase external-tool">
                        <div className="phase-header">
                            <h3>EXTERNAL VISUALIZATION SOFTWARE</h3>
                        </div>

                        <div className="workflow-item">
                            <div className="item-badge">Step 6</div>
                            <h4>Import to Kumu or Gephi</h4>
                            <p>Upload nodes.csv and edges.csv to create stunning visualizations</p>
                            <div className="platform-options">
                                <div className="platform-option">
                                    <strong>Kumu</strong> - Web-based, shareable
                                </div>
                                <div className="platform-option">
                                    <strong>Gephi</strong> - Desktop, publication-quality
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What is a Network Graph */}
            <section className="content-section">
                <h2>What is a Network Graph?</h2>

                <p className="intro-text">
                    A network graph is a visual way to show connections between people, organizations,
                    or things. Think of your LinkedIn connections, family tree, or organization chart -
                    those are all network graphs!
                </p>

                <div className="example-grid">
                    <div className="example-card">
                        
                        <h4>Social Networks</h4>
                        <p>Who knows whom at your event</p>
                    </div>
                    <div className="example-card">
                        
                        <h4>Academic Citations</h4>
                        <p>Which papers reference each other</p>
                    </div>
                    <div className="example-card">
                        
                        <h4>Organizational Structure</h4>
                        <p>Teams and departments</p>
                    </div>
                    <div className="example-card">
                        
                        <h4>Collaboration Networks</h4>
                        <p>Who works with whom</p>
                    </div>
                </div>
            </section>

            {/* Key Concepts */}
            <section className="content-section">
                <h2>Key Concepts Made Simple</h2>

                <div className="concepts-table">
                    <div className="concept-row">
                        <div className="concept-term">
                            <strong>Node</strong>
                        </div>
                        <div className="concept-definition">
                            A person, place, or thing in your network
                        </div>
                        <div className="concept-example">
                            Example: John Smith (attendee)
                        </div>
                    </div>

                    <div className="concept-row">
                        <div className="concept-term">
                            <strong>Edge</strong>
                        </div>
                        <div className="concept-definition">
                            A connection between two nodes
                        </div>
                        <div className="concept-example">
                            Example: John knows Sarah
                        </div>
                    </div>

                    <div className="concept-row">
                        <div className="concept-term">
                            <strong>Attribute</strong>
                        </div>
                        <div className="concept-definition">
                            Additional information about a node
                        </div>
                        <div className="concept-example">
                            Example: John's job title: "Engineer"
                        </div>
                    </div>

                    <div className="concept-row">
                        <div className="concept-term">
                            <strong>Directed</strong>
                        </div>
                        <div className="concept-definition">
                            Connection has a direction (one-way)
                        </div>
                        <div className="concept-example">
                            Example: John follows Sarah on Twitter
                        </div>
                    </div>

                    <div className="concept-row">
                        <div className="concept-term">
                            <strong>Undirected</strong>
                        </div>
                        <div className="concept-definition">
                            Connection goes both ways
                        </div>
                        <div className="concept-example">
                            Example: John and Sarah are friends
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Use Network Graphs */}
            <section className="content-section">
                <h2>Why Use Network Graphs?</h2>

                <div className="benefits-grid">
                    <div className="benefit-card">
                        
                        <h4>Pattern Discovery</h4>
                        <p>Find influential people and natural clusters in your community</p>
                    </div>
                    <div className="benefit-card">
                        
                        <h4>Relationship Mapping</h4>
                        <p>Visualize complex relationships at a glance</p>
                    </div>
                    <div className="benefit-card">
                        
                        <h4>Community Detection</h4>
                        <p>Identify groups and sub-communities</p>
                    </div>
                    <div className="benefit-card">
                        
                        <h4>Impact Analysis</h4>
                        <p>See ripple effects and connection pathways</p>
                    </div>
                </div>
            </section>

            {/* Next Steps */}
            <section className="content-section cta-section">
                <h2>Ready to Get Started?</h2>
                <p>Choose your next step based on your experience level:</p>

                <div className="next-steps-grid">
                    <Link to="/learn/form-creation" className="next-step-card">
                        <div className="card-badge">For Beginners</div>
                        <h3>Learn Form Creation</h3>
                        <p>Step-by-step guide to designing your first form</p>
                        <span className="card-arrow">→</span>
                    </Link>

                    <Link to="/learn/nodes-edges" className="next-step-card">
                        <div className="card-badge">Understand Concepts</div>
                        <h3>Nodes & Edges Deep Dive</h3>
                        <p>Interactive tutorial on network fundamentals</p>
                        <span className="card-arrow">→</span>
                    </Link>

                    <Link to="/learn/export" className="next-step-card">
                        <div className="card-badge">Already Have Data</div>
                        <h3>Export Guide</h3>
                        <p>Learn how to get your data into Kumu or Gephi</p>
                        <span className="card-arrow">→</span>
                    </Link>
                </div>
            </section>
        </div>
    );
}
