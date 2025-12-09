import React from 'react';
import './shared-theme.css';

function ThankYouPage() {
    return (
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-5 text-center">
                                {/* Success Icon */}
                                <div className="mb-4">
                                    <div
                                        className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center"
                                        style={{ width: '80px', height: '80px' }}
                                    >
                                        <svg
                                            width="50"
                                            height="50"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                </div>

                                {/* Thank You Message */}
                                <h1 className="display-5 fw-bold mb-3">Thank You!</h1>
                                <p className="lead text-muted mb-4">
                                    Your response has been successfully submitted.
                                </p>

                                <div className="alert alert-info border-0" role="alert">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Your information will help us build a network map of connections and collaborations from this event.
                                </div>

                                {/* Footer Note */}
                                <div className="mt-4 pt-4 border-top">
                                    <p className="small text-muted mb-0">
                                        If you have any questions or need to update your information, please contact the event organizer.
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

export default ThankYouPage;
