import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import './DynamicForm.css'; // Reuse form styles

function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/'; // Default to homepage

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.email || !formData.password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);

        try {
            const result = await authService.login(formData.email, formData.password);

            if (result.success) {
                // Redirect based on returnTo parameter
                navigate(returnTo);
            } else {
                throw new Error(result.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page bg-light d-flex justify-content-center align-items-center min-vh-100">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-5 col-lg-6 col-md-7">
                        <div className="card shadow-lg border-0 rounded-4">
                            <div className="card-body p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h2 className="mb-2">Welcome Back</h2>
                                    <p className="text-muted">
                                        Log in to access your admin dashboard
                                    </p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger py-2">{error}</div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-2 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? 'Logging in...' : 'Log In'}
                                    </button>
                                </form>

                                <div className="text-center">
                                    <p className="text-muted small mb-0">
                                        Don't have an account?{' '}
                                        <Link to={`/signup?returnTo=${encodeURIComponent(returnTo)}`} className="text-primary">
                                            Sign up
                                        </Link>
                                    </p>
                                </div>

                                <div className="mt-4 p-3 bg-light rounded-3">
                                    <p className="small text-muted mb-0">
                                        <strong>Note:</strong> This is a demo implementation. In production, authentication should be handled securely via your MongoDB backend with JWT tokens.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
