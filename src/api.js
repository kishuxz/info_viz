// src/api.js - API functions for backend communication
import axios from 'axios';

// Base URL for API - update to use new Node.js backend on port 5001
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Helper function for API calls
const apiCall = async (method, endpoint, data = null) => {
    try {
        const config = {
            method,
            url: `${API_BASE_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Add authorization token if available
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`API Error (${method} ${endpoint}):`, error);

        // Handle 401 Unauthorized - redirect to login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('adminId');
            localStorage.removeItem('adminName');
            localStorage.removeItem('userEmail');
            window.location.href = '/login';
        }

        throw error;
    }
};

// Get all forms for a specific admin
export const getFormsForAdmin = async (adminId) => {
    try {
        return await apiCall('GET', `/forms/admin/${adminId}`);
    } catch (error) {
        console.error('Error fetching forms for admin:', error);
        // Return empty array as fallback
        return [];
    }
};

// Get a single form by ID
export const getForm = async (formId) => {
    try {
        const response = await apiCall('GET', `/forms/${formId}`);
        // Backend returns {success: true, data: formObject}
        // We need to return just the formObject
        return response.data || response;
    } catch (error) {
        console.error('Error fetching form:', error);
        throw error;
    }
};

// Get all responses for a specific form
export const getResponses = async (formId) => {
    try {
        return await apiCall('GET', `/forms/${formId}/responses`);
    } catch (error) {
        console.error('Error fetching responses:', error);
        // Return empty array as fallback
        return [];
    }
};

// Save or update a form
export const saveForm = async (formData) => {
    try {
        console.log('saveForm: Starting API call with data:', formData);

        // Always use POST - backend handles create/update logic
        const method = 'POST';
        const endpoint = '/forms';
        console.log(`saveForm: Using ${method} ${endpoint}`);

        const result = await apiCall(method, endpoint, formData);
        console.log('saveForm: Success! Result:', result);
        return result;
    } catch (error) {
        console.error('saveForm: ERROR occurred');
        console.error('saveForm: Error object:', error);
        console.error('saveForm: Error message:', error.message);
        console.error('saveForm: Error response:', error.response?.data);
        console.error('saveForm: Error status:', error.response?.status);
        throw error;
    }
};

// Submit a form response
export const submitForm = async (formId, responseData) => {
    try {
        return await apiCall('POST', `/forms/${formId}/submit`, responseData);
    } catch (error) {
        console.error('Error submitting form:', error);
        throw error;
    }
};

// Delete a form
export const deleteForm = async (formId) => {
    try {
        return await apiCall('DELETE', `/forms/${formId}`);
    } catch (error) {
        console.error('Error deleting form:', error);
        throw error;
    }
};

// Convert form data to network format (nodes and edges)
export const convertToNetwork = async (formId, responseData) => {
    try {
        return await apiCall('POST', `/forms/${formId}/convert`, responseData);
    } catch (error) {
        console.error('Error converting to network:', error);
        throw error;
    }
};
