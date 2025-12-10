import React from 'react';
import { Link } from 'react-router-dom';
import './NetworkExamplesPage.css';
import Footer from './Footer';

function NetworkExamplesPage() {
    const kumuExamples = [
        {
            id: 1,
            image: '/assets/examples/kumu-network-1.png',
            title: 'Event→Sector→Org Full Network',
            description: 'Complete 3-layer network visualization showing how different sectors connect organizations at an event. Features a clean legend with cyan event nodes, yellow sector nodes, and purple organization nodes.'
        },
        {
            id: 2,
            image: '/assets/examples/kumu-network-2.png',
            title: 'Sector-Focused Network View',
            description: 'Zoomed view highlighting Research Sectors (NLP, Robotics, Computer Vision) and how they group different organizations. Shows the hub-and-spoke pattern of sector-based organization.'
        },
        {
            id: 3,
            image: '/assets/examples/kumu-network-3.png',
            title: 'Cross-Sector Connections',
            description: 'Detailed visualization showing organizations linked through multiple research sectors with connection types and meeting frequency indicators.'
        },
        {
            id: 4,
            image: '/assets/examples/kumu-network-4.png',
            title: 'Multi-Edge Network with Legend',
            description: 'Advanced network visualization with comprehensive legend showing Event↔Sector and Sector↔Org connection types, color-coded edge styles, and prior meeting frequency.'
        },
        {
            id: 5,
            image: '/assets/examples/kumu-network-5.png',
            title: 'Custom Color Scheme Network',
            description: 'Same network structure with alternative warm color palette (red/orange/yellow) demonstrating Kumu\'s customization options for different presentation contexts.'
        }
    ];

    const gephiExamples = [
        {
            id: 1,
            image: '/assets/examples/gephi-network-example.png',
            title: 'Event-Organization Network (Health Camps)',
            description: 'Force-directed layout showing health camp events (black center nodes) connected to participating organizations (light blue). Uses Gephi\'s ForceAtlas2 algorithm to reveal community clusters and hub organizations.'
        }
    ];

    return (
        <div className="network-examples-page">
            <div className="examples-hero">
                <div className="examples-hero-content">
                    <h1>Network Visualization Examples</h1>
                    <p>
                        Explore how your event network data looks when imported into Kumu and Gephi.
                        These examples showcase Event→Sector→Organization networks with clean legends and interactive layouts.
                    </p>
                    <Link to="/split" className="btn-primary">
                        Try It Yourself →
                    </Link>
                </div>
            </div>

            <div className="examples-container">
                {/* Kumu Examples Section */}
                <section className="examples-section">
                    <div className="section-header">
                        <div className="section-title-group">
                            <h2>Kumu Network Visualizations</h2>
                            <span className="platform-badge kumu-badge">Web-Based</span>
                        </div>
                        <p className="section-description">
                            Kumu offers clean, colorful network maps perfect for stakeholder presentations and interactive exploration.
                            Ideal for sharing via web links and collaborative analysis.
                        </p>
                    </div>

                    <div className="examples-grid">
                        {kumuExamples.map((example) => (
                            <div
                                key={example.id}
                                className="example-card"
                                onClick={() => window.open(example.image, '_blank')}
                            >
                                <div className="example-image-container">
                                    <img
                                        src={example.image}
                                        alt={example.title}
                                        className="example-image"
                                    />
                                    <div className="example-overlay">
                                        <button className="view-full-btn">Click to View Full Size</button>
                                    </div>
                                </div>
                                <div className="example-content">
                                    <h3>{example.title}</h3>
                                    <p>{example.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="platform-info-card">
                        <h4>About Kumu</h4>
                        <ul>
                            <li><strong>Best for:</strong> Stakeholder presentations, web sharing, collaborative analysis</li>
                            <li><strong>Pros:</strong> No installation needed, easy sharing, interactive web interface</li>
                            <li><strong>Cons:</strong> Limited advanced analytics compared to Gephi</li>
                            <li><strong>Getting Started:</strong> Create free account at <a href="https://kumu.io" target="_blank" rel="noopener noreferrer">kumu.io</a></li>
                        </ul>
                    </div>
                </section>

                {/* Gephi Examples Section */}
                <section className="examples-section">
                    <div className="section-header">
                        <div className="section-title-group">
                            <h2>Gephi Network Visualizations</h2>
                            <span className="platform-badge gephi-badge">Desktop Software</span>
                        </div>
                        <p className="section-description">
                            Gephi provides powerful force-directed layouts with advanced analytics including centrality measures,
                            community detection, and clustering. Perfect for academic research and deep network analysis.
                        </p>
                    </div>

                    <div className="examples-grid">
                        {gephiExamples.map((example) => (
                            <div
                                key={example.id}
                                className="example-card"
                                onClick={() => window.open(example.image, '_blank')}
                            >
                                <div className="example-image-container">
                                    <img
                                        src={example.image}
                                        alt={example.title}
                                        className="example-image"
                                    />
                                    <div className="example-overlay">
                                        <button className="view-full-btn">Click to View Full Size</button>
                                    </div>
                                </div>
                                <div className="example-content">
                                    <h3>{example.title}</h3>
                                    <p>{example.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="platform-info-card">
                        <h4>About Gephi</h4>
                        <ul>
                            <li><strong>Best for:</strong> Academic research, advanced analytics, publication-quality graphics</li>
                            <li><strong>Pros:</strong> Powerful algorithms, extensive metrics, free and open source</li>
                            <li><strong>Cons:</strong> Steeper learning curve, requires installation</li>
                            <li><strong>Getting Started:</strong> Download from <a href="https://gephi.org" target="_blank" rel="noopener noreferrer">gephi.org</a></li>
                        </ul>
                    </div>
                </section>

                {/* How to Export Section */}
                <section className="export-guide-section">
                    <h2>How to Export Your Data</h2>
                    <div className="export-steps">
                        <div className="export-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Upload Your Data</h3>
                                <p>Go to the <Link to="/split">Split Page</Link> and upload your CSV or Excel files with event participant data.</p>
                            </div>
                        </div>
                        <div className="export-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Map Columns</h3>
                                <p>Tell us which columns contain organization names, sectors, event details, and connections.</p>
                            </div>
                        </div>
                        <div className="export-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Convert & Download</h3>
                                <p>Click "Convert to Network" and download nodes_kumu.csv + edges_kumu.csv (or gephi versions).</p>
                            </div>
                        </div>
                        <div className="export-step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h3>Import & Visualize</h3>
                                <p>Import the CSV files into Kumu or Gephi to create your interactive network visualization.</p>
                            </div>
                        </div>
                    </div>

                    <div className="cta-section">
                        <Link to="/split" className="btn-primary-large">
                            Start Creating Your Network →
                        </Link>
                        <Link to="/learn/export-guide" className="btn-secondary-large">
                            View Detailed Export Guide
                        </Link>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
}

export default NetworkExamplesPage;
