import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import './LearnLayout.css';

export default function LearnLayout() {
    const location = useLocation();

    const navItems = [
        { path: '/learn/getting-started', label: 'Getting Started' },
        { path: '/learn/form-creation', label: 'Form Creation Guide' },
        { path: '/learn/nodes-edges', label: 'Nodes & Edges' },
        { path: '/learn/export', label: 'Export to Kumu/Gephi' },
        { path: '/learn/examples', label: 'Use Cases' },
        { path: '/learn/faq', label: 'FAQ' }
    ];

    return (
        <div className="learn-layout">
            <div className="learn-container">
                {/* Sidebar Navigation */}
                <aside className="learn-sidebar">
                    <div className="learn-sidebar-header">
                        <h2>Learning Hub</h2>
                        <p>Master network data collection</p>
                    </div>

                    <nav className="learn-nav">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`learn-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="learn-sidebar-footer">
                        <div className="help-card">
                            <h4>Need Help?</h4>
                            <p>Check our FAQ or reach out to the community</p>
                            <Link to="/learn/faq" className="btn-help">View FAQ</Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="learn-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
