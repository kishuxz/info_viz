import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import './DynamicForm.css'; // Reuse form styles

function SignupPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/'; // Default to homepage

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
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
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const result = await authService.register(
                formData.name,
                formData.email,
                formData.password,
                'admin' // Set role as admin for form creators
            );

            if (result.success) {
                // Redirect based on returnTo parameter
                navigate(returnTo);
            } else {
                // Show specific error from backend
                setError(result.error || 'Registration failed. Please try again.');
                return;
            }
        } catch (err) {
            console.error('Registration error:', err);
            // Show the actual error message
            const errorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
            setError(errorMessage);
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
                                    <h2 className="mb-2">Create Account</h2>
                                    <p className="text-muted">
                                        Sign up to start managing your event forms
                                    </p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger py-2">{error}</div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

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
                                        />
                                    </div>

                                    <div className="mb-3">
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
                                            placeholder="At least 6 characters"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="confirmPassword" className="form-label">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Re-enter your password"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-2 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating Account...' : 'Sign Up'}
                                    </button>
                                </form>

                                <div className="text-center">
                                    <p className="text-muted small mb-0">
                                        Already have an account?{' '}
                                        <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="text-primary">
                                            Log in
                                        </Link>
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

export default SignupPage;
