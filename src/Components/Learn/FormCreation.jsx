import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FormCreation.css';

export default function FormCreation() {
    const [activeLevel, setActiveLevel] = useState('beginner');

    const formLevels = {
        beginner: {
            title: 'Simple Event Form',
            goal: 'Map connections at a networking event',
            essential: [
                'Your Name (Node attribute)',
                'Email (Unique identifier)',
                'Organization (Node attribute)',
                'Who did you meet? (Creates edges)'
            ],
            optional: [
                'Job Title',
                'Industry',
                'Location'
            ]
        },
        intermediate: {
            title: 'Conference Network',
            goal: 'Analyze collaboration potential',
            essential: [
                'Participant Info (name, email, organization)',
                'Research Interests (Node attribute)',
                'Previous Collaborators (Edges)',
                'Looking to collaborate with (Potential edges)'
            ],
            optional: [
                'Number of publications',
                'Years of experience',
                'Skills/Expertise tags'
            ]
        },
        advanced: {
            title: 'Multi-Layer Networks',
            goal: 'Capture different relationship types',
            essential: [
                'Professional connections',
                'Personal connections',
                'Collaboration history',
                'Mentorship relationships',
                'Project teams'
            ],
            optional: [
                'Relationship strength ratings',
                'Time-based connection data',
                'Multi-dimensional attributes'
            ]
        }
    };

    return (
        <div className="form-creation-page">
            {/* Header */}
            <header className="page-header">
                <div className="breadcrumb">
                    <Link to="/learn/getting-started">← Getting Started</Link>
                </div>
                <h1> Form Creation Guide</h1>
                <p className="page-subtitle">
                    Learn how to design forms that collect network data effectively
                </p>
            </header>

            {/* Key Message */}
            <section className="content-section">
                <div className="info-banner">
                    <div className="banner-icon"></div>
                    <div className="banner-content">
                        <h3>Remember: You're Creating the Data Collection Tool</h3>
                        <p>
                            Your form is how you collect information about people and their connections.
                            A well-designed form makes it easy for attendees to share who they know,
                            which creates the edges in your network.
                        </p>
                        <p className="banner-note">
                            <strong>You're not creating the network graph here.</strong> You're creating
                            the form that will collect the data to build that graph.
                        </p>
                    </div>
                </div>
            </section>

            {/* Essential Form Structure */}
            <section className="content-section">
                <h2>📋 Every Network Form Needs These 3 Sections</h2>

                <div className="form-structure-grid">
                    <div className="structure-card">
                        <div className="structure-header green">
                            <h3>Section 1: Participant Information</h3>
                            <span className="sub-label">This creates the NODES</span>
                        </div>
                        <div className="structure-content">
                            <h4>Required Fields:</h4>
                            <ul className="field-list">
                                <li className="required-field">
                                    <span className="field-icon">✓</span>
                                    <strong>Full Name</strong> - Must be unique identifier
                                </li>
                                <li className="required-field">
                                    <span className="field-icon">✓</span>
                                    <strong>Email</strong> - For verification and uniqueness
                                </li>
                            </ul>
                            <h4>Recommended Fields:</h4>
                            <ul className="field-list">
                                <li className="optional-field">
                                    <span className="field-icon">○</span>
                                    Organization
                                </li>
                                <li className="optional-field">
                                    <span className="field-icon">○</span>
                                    Job Title
                                </li>
                                <li className="optional-field">
                                    <span className="field-icon">○</span>
                                    Location
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="structure-card">
                        <div className="structure-header blue">
                            <h3>Section 2: Connections</h3>
                            <span className="sub-label">This creates the EDGES</span>
                        </div>
                        <div className="structure-content">
                            <h4>Connection Questions:</h4>
                            <ul className="field-list">
                                <li className="required-field">
                                    <span className="field-icon">✓</span>
                                    <strong>"Who did you meet?"</strong> (multi-select)
                                </li>
                                <li className="optional-field">
                                    <span className="field-icon">○</span>
                                    "Who would you collaborate with?"
                                </li>
                                <li className="optional-field">
                                    <span className="field-icon">○</span>
                                    "Who referred you?"
                                </li>
                                <li className="optional-field">
                                    <span className="field-icon">○</span>
                                    "Who do you know from previous events?"
                                </li>
                            </ul>
                            <div className="tip-box">
                                <strong>Tip:</strong> Multiple connection fields = richer network data!
                            </div>
                        </div>
                    </div>

                    <div className="structure-card">
                        <div className="structure-header purple">
                            <h3>Section 3: Additional Attributes</h3>
                            <span className="sub-label">This enriches the NODES</span>
                        </div>
                        <div className="structure-content">
                            <h4>Optional but Useful:</h4>
                            <ul className="field-list">
                                <li className="optional-field">
                                    <span className="field-icon">○</span>
                                    Skills/Expertise (tags)
                                </li>
                                <li className="optional-field">
                                    <span className="field-icon">○</span>
                                    Research interests
                                </li>
                                <li className="optional-field">
                                    <span className="field-icon">○</span>
                                    Years of experience
                                </li>
                                <li className="optional-field">
                                    <span className="field-icon">○</span>
                                    Industry sector
                                </li>
                            </ul>
                            <div className="tip-box">
                                <strong>Tip:</strong> These help you filter and analyze your network later!
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Progressive Learning */}
            <section className="content-section">
                <h2>🎓 Form Design by Experience Level</h2>

                <div className="level-selector">
                    <button
                        className={`level-btn ${activeLevel === 'beginner' ? 'active' : ''}`}
                        onClick={() => setActiveLevel('beginner')}
                    >
                        Beginner
                    </button>
                    <button
                        className={`level-btn ${activeLevel === 'intermediate' ? 'active' : ''}`}
                        onClick={() => setActiveLevel('intermediate')}
                    >
                        Intermediate
                    </button>
                    <button
                        className={`level-btn ${activeLevel === 'advanced' ? 'active' : ''}`}
                        onClick={() => setActiveLevel('advanced')}
                    >
                        Advanced
                    </button>
                </div>

                <div className="level-content">
                    <div className="level-header">
                        <h3>{formLevels[activeLevel].title}</h3>
                        <p className="level-goal"><strong>Goal:</strong> {formLevels[activeLevel].goal}</p>
                    </div>

                    <div className="level-fields">
                        <div className="fields-column">
                            <h4>Essential Fields:</h4>
                            <ul>
                                {formLevels[activeLevel].essential.map((field, index) => (
                                    <li key={index} className="essential-item">✓ {field}</li>
                                ))}
                            </ul>
                        </div>

                        {formLevels[activeLevel].optional.length > 0 && (
                            <div className="fields-column">
                                <h4>Optional Fields:</h4>
                                <ul>
                                    {formLevels[activeLevel].optional.map((field, index) => (
                                        <li key={index} className="optional-item">○ {field}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* After Form Creation */}
            <section className="content-section">
                <h2> After You Create Your Form</h2>

                <div className="workflow-post-creation">
                    <div className="post-step">
                        <div className="post-number">1</div>
                        <div className="post-content">
                            <h4>You Get a Public URL</h4>
                            <div className="url-example">
                                https://networkmap.com/form/tech-conf-2025
                            </div>
                        </div>
                    </div>

                    <div className="post-step">
                        <div className="post-number">2</div>
                        <div className="post-content">
                            <h4>Share It with Attendees</h4>
                            <ul>
                                <li>📧 Email before the event</li>
                                <li>📱 QR code at registration desk</li>
                                <li> Social media post</li>
                                <li> Event website link</li>
                            </ul>
                        </div>
                    </div>

                    <div className="post-step">
                        <div className="post-number">3</div>
                        <div className="post-content">
                            <h4>Attendees Fill It Out</h4>
                            <p>They see a clean form (like Google Forms)</p>
                            <p>They enter their info + select connections</p>
                            <p>Submit button saves to database</p>
                        </div>
                    </div>

                    <div className="post-step">
                        <div className="post-number">4</div>
                        <div className="post-content">
                            <h4>View Responses in Real-Time</h4>
                            <p>See who has responded</p>
                            <p>Preview the data table</p>
                            <p>Check for any issues</p>
                        </div>
                    </div>

                    <div className="post-step">
                        <div className="post-number">5</div>
                        <div className="post-content">
                            <h4>Export When Ready</h4>
                            <p>Click "Export for Kumu" or "Export for Gephi"</p>
                            <p>Download nodes.csv and edges.csv</p>
                            <p>Ready to visualize!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Common Patterns */}
            <section className="content-section">
                <h2> Common Form Design Patterns</h2>

                <div className="pattern-grid">
                    <div className="pattern-card">
                        <div className="pattern-header">
                            <h3>Pattern 1: Simple Networking Event</h3>
                            <span className="pattern-badge">Most Popular</span>
                        </div>
                        <div className="pattern-fields">
                            <div className="field-item">📌 Full Name* (Text)</div>
                            <div className="field-item">📌 Email* (Email)</div>
                            <div className="field-item">📌 Company (Text)</div>
                            <div className="field-item">📌 Job Title (Text)</div>
                            <div className="field-item edge-field"> People you connected with (Multi-select)</div>
                        </div>
                        <div className="pattern-result">
                            → Creates: Undirected edges between attendees
                        </div>
                    </div>

                    <div className="pattern-card">
                        <div className="pattern-header">
                            <h3>Pattern 2: Academic Collaboration</h3>
                            <span className="pattern-badge">For Researchers</span>
                        </div>
                        <div className="pattern-fields">
                            <div className="field-item">📌 Researcher Name* (Text)</div>
                            <div className="field-item">📌 Institution* (Text)</div>
                            <div className="field-item">📌 Research Area* (Dropdown)</div>
                            <div className="field-item edge-field"> Co-authors (Multi-select)</div>
                        </div>
                        <div className="pattern-result">
                            → Creates: Directed edges (citation network)
                        </div>
                    </div>

                    <div className="pattern-card">
                        <div className="pattern-header">
                            <h3>Pattern 3: Project Teams</h3>
                            <span className="pattern-badge">For Organizations</span>
                        </div>
                        <div className="pattern-fields">
                            <div className="field-item">📌 Team Member Name* (Text)</div>
                            <div className="field-item">📌 Role* (Dropdown)</div>
                            <div className="field-item">📌 Department (Text)</div>
                            <div className="field-item edge-field"> Collaborates with (Multi-select)</div>
                            <div className="field-item">📌 Project involvement (Checkboxes)</div>
                        </div>
                        <div className="pattern-result">
                            → Creates: Multi-layered network with roles
                        </div>
                    </div>
                </div>
            </section>

            {/* Best Practices */}
            <section className="content-section">
                <h2>✨ Best Practices</h2>

                <div className="best-practices-grid">
                    <div className="practice-card do">
                        <h4> DO</h4>
                        <ul>
                            <li>Use clear, descriptive field labels</li>
                            <li>Mark required fields with asterisk (*)</li>
                            <li>Provide examples in placeholder text</li>
                            <li>Keep connection questions simple</li>
                            <li>Test your form before sharing</li>
                            <li>Include a "thank you" message</li>
                        </ul>
                    </div>

                    <div className="practice-card dont">
                        <h4>❌ DON'T</h4>
                        <ul>
                            <li>Ask for too much information upfront</li>
                            <li>Use technical jargon (nodes/edges)</li>
                            <li>Make every field required</li>
                            <li>Forget to explain what data will be used for</li>
                            <li>Skip email validation</li>
                            <li>Use confusing connection questions</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Next Steps */}
            <section className="content-section next-section">
                <h2> Continue Learning</h2>
                <div className="next-links">
                    <Link to="/learn/nodes-edges" className="next-link-card">
                        <h4>Next: Understand Nodes & Edges</h4>
                        <p>Learn how form responses become network data</p>
                        <span className="arrow">→</span>
                    </Link>
                    <Link to="/learn/export" className="next-link-card">
                        <h4>Skip to: Export Guide</h4>
                        <p>Already have data? Learn how to export it</p>
                        <span className="arrow">→</span>
                    </Link>
                </div>
            </section>
        </div>
    );
}
