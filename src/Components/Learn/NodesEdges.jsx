import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NodesEdges.css';

export default function NodesEdges() {
    const [activeExample, setActiveExample] = useState('social');

    const examples = {
        social: {
            title: 'Social Network',
            formQuestions: [
                { q: 'Your Name', creates: 'node', color: 'green' },
                { q: 'Your Organization', creates: 'node-attr', color: 'purple' },
                { q: 'Who did you meet?', creates: 'edge', color: 'blue' }
            ],
            nodes: [
                { name: 'Alice', org: 'Tech Corp' },
                { name: 'Bob', org: 'Design Studio' },
                { name: 'Carol', org: 'Tech Corp' }
            ],
            edges: [
                { from: 'Alice', to: 'Bob', type: 'met' },
                { from: 'Alice', to: 'Carol', type: 'met' }
            ]
        },
        collaboration: {
            title: 'Collaboration Network',
            formQuestions: [
                { q: 'Researcher Name', creates: 'node', color: 'green' },
                { q: 'Institution', creates: 'node-attr', color: 'purple' },
                { q: 'Research Area', creates: 'node-attr', color: 'purple' },
                { q: 'Who have you collaborated with?', creates: 'edge', color: 'blue' }
            ],
            nodes: [
                { name: 'Dr. Smith', org: 'MIT', area: 'AI' },
                { name: 'Dr. Lee', org: 'Stanford', area: 'Robotics' },
                { name: 'Dr. Chen', org: 'MIT', area: 'AI' }
            ],
            edges: [
                { from: 'Dr. Smith', to: 'Dr. Lee', type: 'collaborated' },
                { from: 'Dr. Smith', to: 'Dr. Chen', type: 'collaborated' }
            ]
        }
    };

    const current = examples[activeExample];

    return (
        <div className="nodes-edges-page">
            {/* Header */}
            <header className="page-header">
                <div className="breadcrumb">
                    <Link to="/learn/getting-started">← Getting Started</Link>
                </div>
                <h1> Understanding Nodes and Edges</h1>
                <p className="page-subtitle">
                    Learn how form questions transform into network data
                </p>
            </header>

            {/* The Big Picture */}
            <section className="content-section">
                <div className="info-box primary">
                    <h3>The Golden Rule of Network Forms</h3>
                    <p>
                        Every question you add to your form does ONE of three things:
                    </p>
                    <div className="rule-grid">
                        <div className="rule-card green">
                            <div className="rule-icon">⬤</div>
                            <h4>Creates a NODE</h4>
                            <p>Questions about <strong>who</strong> is filling the form</p>
                            <p className="rule-example">Example: "What's your name?"</p>
                        </div>
                        <div className="rule-card purple">
                            <div className="rule-icon"></div>
                            <h4>Adds NODE ATTRIBUTES</h4>
                            <p>Questions about <strong>details</strong> of that person</p>
                            <p className="rule-example">Example: "What's your organization?"</p>
                        </div>
                        <div className="rule-card blue">
                            <div className="rule-icon">↔</div>
                            <h4>Creates EDGES</h4>
                            <p>Questions about <strong>connections</strong> to others</p>
                            <p className="rule-example">Example: "Who did you meet?"</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Example */}
            <section className="content-section">
                <h2> See It In Action</h2>
                <p className="intro-text">
                    Choose a scenario to see how form questions become network data:
                </p>

                <div className="example-selector">
                    <button
                        className={`example-btn ${activeExample === 'social' ? 'active' : ''}`}
                        onClick={() => setActiveExample('social')}
                    >
                        Social Event
                    </button>
                    <button
                        className={`example-btn ${activeExample === 'collaboration' ? 'active' : ''}`}
                        onClick={() => setActiveExample('collaboration')}
                    >
                        Research Network
                    </button>
                </div>

                <div className="example-demo">
                    <div className="demo-header">
                        <h3>{current.title}</h3>
                    </div>

                    <div className="demo-grid">
                        {/* Form Questions */}
                        <div className="demo-section">
                            <h4> Form Questions</h4>
                            <div className="question-list">
                                {current.formQuestions.map((q, i) => (
                                    <div key={i} className={`question-item ${q.color}`}>
                                        <span className="q-text">{q.q}</span>
                                        <span className="q-badge">{q.creates.replace('-', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="demo-arrow">→</div>

                        {/* Network Data */}
                        <div className="demo-section">
                            <h4> Network Data Created</h4>
                            <div className="data-preview">
                                <div className="data-label">Nodes ({current.nodes.length})</div>
                                <div className="data-items">
                                    {current.nodes.map((node, i) => (
                                        <div key={i} className="data-node">
                                            {node.name}
                                            <span className="node-attrs">
                                                {Object.entries(node).filter(([k]) => k !== 'name').map(([k, v]) => v).join(', ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="data-label">Edges ({current.edges.length})</div>
                                <div className="data-items">
                                    {current.edges.map((edge, i) => (
                                        <div key={i} className="data-edge">
                                            {edge.from} ↔ {edge.to}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Deep Dive: Nodes */}
            <section className="content-section">
                <h2>⬤ Deep Dive: Nodes</h2>

                <div className="concept-card">
                    <h3>What is a Node?</h3>
                    <p>
                        A node represents a <strong>person, organization, or entity</strong> in your network.
                        In most event forms, each person who fills out the form becomes ONE node.
                    </p>
                </div>

                <div className="detail-grid">
                    <div className="detail-card">
                        <h4>Node Identity</h4>
                        <p>The question that uniquely identifies the person:</p>
                        <ul>
                            <li>"What's your name?"</li>
                            <li>"What's your email?"</li>
                            <li>"Your organization name"</li>
                        </ul>
                        <div className="detail-note">
                             This becomes the node's ID in the network
                        </div>
                    </div>

                    <div className="detail-card">
                        <h4>Node Attributes</h4>
                        <p>Additional information ABOUT that person:</p>
                        <ul>
                            <li>Job title</li>
                            <li>Department</li>
                            <li>Location</li>
                            <li>Skills</li>
                            <li>Industry</li>
                        </ul>
                        <div className="detail-note">
                             Use these to filter and color your network later
                        </div>
                    </div>
                </div>
            </section>

            {/* Deep Dive: Edges */}
            <section className="content-section">
                <h2>↔ Deep Dive: Edges</h2>

                <div className="concept-card">
                    <h3>What is an Edge?</h3>
                    <p>
                        An edge represents a <strong>relationship or connection</strong> between two nodes.
                        Connection questions create edges in your network.
                    </p>
                </div>

                <div className="edge-types">
                    <div className="edge-type-card">
                        <h4>Asking About Connections</h4>
                        <p>These questions create edges:</p>
                        <ul>
                            <li>"Who did you meet at the event?" →  Creates edges to those people</li>
                            <li>"Who do you know from before?" → Creates edges with "prior connection" label</li>
                            <li>"Who would you like to collaborate with?" → Creates directed edges</li>
                        </ul>
                    </div>

                    <div className="edge-type-card">
                        <h4>Directed vs Undirected</h4>
                        <div className="direction-examples">
                            <div className="direction-example">
                                <div className="direction-label">Undirected (mutual)</div>
                                <div className="direction-viz">Alice ↔ Bob</div>
                                <p>"Alice and Bob met" (goes both ways)</p>
                            </div>
                            <div className="direction-example">
                                <div className="direction-label">Directed (one-way)</div>
                                <div className="direction-viz">Alice → Bob</div>
                                <p>"Alice follows Bob" (one direction)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form Design Tips */}
            <section className="content-section">
                <h2>✨ Form Design Tips</h2>

                <div className="tips-grid">
                    <div className="tip-card">
                        <div className="tip-number">1</div>
                        <h4>Start with Identity</h4>
                        <p>Always include ONE question that uniquely identifies each person (name, email, or organization)</p>
                    </div>

                    <div className="tip-card">
                        <div className="tip-number">2</div>
                        <h4>Add Useful Attributes</h4>
                        <p>Include 3-5 questions about details you want to filter by later (job title, location, industry)</p>
                    </div>

                    <div className="tip-card">
                        <div className="tip-number">3</div>
                        <h4>Include Connections</h4>
                        <p>Add at least ONE question about who they know/met to create edges in your network</p>
                    </div>

                    <div className="tip-card">
                        <div className="tip-number">4</div>
                        <h4>Keep It Simple</h4>
                        <p>10-15 questions maximum. Too many fields = lower completion rate</p>
                    </div>
                </div>
            </section>

            {/* Next Steps */}
            <section className="content-section next-section">
                <h2> Continue Learning</h2>
                <div className="next-links">
                    <Link to="/learn/form-creation" className="next-link-card">
                        <span className="card-badge">Previous</span>
                        <h4>← Form Creation Guide</h4>
                        <p>Learn how to design effective forms</p>
                    </Link>
                    <Link to="/learn/export" className="next-link-card">
                        <span className="card-badge">Next</span>
                        <h4>Export to Kumu/Gephi →</h4>
                        <p>Get your data ready for visualization</p>
                    </Link>
                </div>
            </section>
        </div>
    );
}
