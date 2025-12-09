import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DynamicForm.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState('');
    const [forms, setForms] = useState([]);

    useEffect(() => {
        // Get admin info from localStorage
        const name = localStorage.getItem('adminName') || 'Admin';
        setAdminName(name);

        // TODO: Fetch user's forms from backend
        // For now, using empty array
        setForms([]);
    }, []);

    const quickActions = [
        {
            title: 'Create New Form',
            description: 'Design a new event registration form',
            icon: '📝',
            action: () => navigate('/forms/builder'),
            color: '#4F46E5'
        },
        {
            title: 'View Analytics',
            description: 'Explore participant data and insights',
            icon: '📊',
            action: () => navigate('/analytics'),
            color: '#10B981'
        },
        {
            title: 'Manage Forms',
            description: 'Edit or view your existing forms',
            icon: '📋',
            action: () => navigate('/forms/builder'),
            color: '#F59E0B'
        }
    ];

    return (
        <div className="form-page bg-light min-vh-100" style={{ paddingTop: '80px', paddingBottom: '60px' }}>
            <div className="container">
                {/* Welcome Section */}
                <div className="row mb-5">
                    <div className="col-12">
                        <h1 className="display-5 mb-2">Welcome back, {adminName}! 👋</h1>
                        <p className="text-muted lead">
                            Manage your event forms and analyze participant connections
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="row mb-5">
                    <div className="col-12 mb-3">
                        <h3>Quick Actions</h3>
                    </div>
                    {quickActions.map((action, index) => (
                        <div key={index} className="col-md-4 mb-4">
                            <div
                                className="card h-100 border-0 shadow-sm"
                                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                onClick={action.action}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div className="card-body p-4">
                                    <div
                                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            backgroundColor: `${action.color}15`,
                                            fontSize: '28px'
                                        }}
                                    >
                                        {action.icon}
                                    </div>
                                    <h5 className="card-title mb-2">{action.title}</h5>
                                    <p className="card-text text-muted small mb-0">
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* User's Forms */}
                <div className="row">
                    <div className="col-12 mb-3">
                        <h3>Your Event Forms</h3>
                    </div>
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                {forms.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-4" style={{ fontSize: '64px', opacity: 0.3 }}>
                                            📋
                                        </div>
                                        <h5 className="mb-2">No forms yet</h5>
                                        <p className="text-muted mb-4">
                                            Create your first event registration form to start collecting participant data
                                        </p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate('/forms/builder')}
                                        >
                                            Create Your First Form
                                        </button>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Event Name</th>
                                                    <th>Created</th>
                                                    <th>Responses</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {forms.map((form, index) => (
                                                    <tr key={index}>
                                                        <td>{form.name}</td>
                                                        <td>{form.created}</td>
                                                        <td>{form.responses}</td>
                                                        <td>
                                                            <span className="badge bg-success">Active</span>
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-primary me-2">
                                                                Edit
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-secondary">
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div className="row mt-5">
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <h5 className="card-title mb-3">Account Information</h5>
                                <div className="mb-2">
                                    <small className="text-muted">Name</small>
                                    <p className="mb-3">{adminName}</p>
                                </div>
                                <div className="mb-2">
                                    <small className="text-muted">Email</small>
                                    <p className="mb-3">{localStorage.getItem('userEmail') || 'Not set'}</p>
                                </div>
                                <div className="mb-2">
                                    <small className="text-muted">Admin ID</small>
                                    <p className="mb-0">
                                        <code style={{ fontSize: '12px' }}>
                                            {localStorage.getItem('adminId') || 'Not set'}
                                        </code>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <h5 className="card-title mb-3">Getting Started</h5>
                                <ul className="list-unstyled mb-0">
                                    <li className="mb-3">
                                        <strong>1. Create a Form</strong>
                                        <p className="text-muted small mb-0">
                                            Design your event registration form with custom fields
                                        </p>
                                    </li>
                                    <li className="mb-3">
                                        <strong>2. Share with Participants</strong>
                                        <p className="text-muted small mb-0">
                                            Get a public URL to share with your event attendees
                                        </p>
                                    </li>
                                    <li className="mb-0">
                                        <strong>3. Analyze Connections</strong>
                                        <p className="text-muted small mb-0">
                                            Export data to Kumu or Gephi for network visualization
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
