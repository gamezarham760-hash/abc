// ============================================================
//  Rescue 1122 HRM — Frontend Configuration
//  This file connects the HTML frontend to the Laravel API.
//
//  IMPORTANT: Update API_BASE if your Laravel API runs on
//  a different port or host.
// ============================================================

// ── API BASE URL ─────────────────────────────────────────
// Laravel API runs on port 8000 by default (php artisan serve)
const API_BASE = 'http://127.0.0.1:8000/api';

// Keep BASE pointing to the frontend folder for photo URLs
// (photos are served from Laravel's public/storage/uploads/)
const PHOTO_BASE = 'http://127.0.0.1:8000/storage/uploads/';

// Legacy aliases — kept so existing HTML files don't break
const BASE     = API_BASE;
const BASE_URL = API_BASE;

// ── TOKEN MANAGEMENT ────────────────────────────────────
const Auth = {
    // Save token after login
    setToken(token) {
        localStorage.setItem('hrm_token', token);
    },
    // Get saved token
    getToken() {
        return localStorage.getItem('hrm_token');
    },
    // Remove token on logout
    clearToken() {
        localStorage.removeItem('hrm_token');
        localStorage.removeItem('hrm_user');
    },
    // Save user info
    setUser(user) {
        localStorage.setItem('hrm_user', JSON.stringify(user));
    },
    // Get user info
    getUser() {
        try {
            return JSON.parse(localStorage.getItem('hrm_user') || 'null');
        } catch {
            return null;
        }
    },
    // Check if logged in
    isLoggedIn() {
        return !! this.getToken();
    },
    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
        }
    }
};

// ── FETCH WRAPPER ────────────────────────────────────────
// All API calls go through this — it automatically adds
// the Authorization header with the Bearer token.
async function apiFetch(endpoint, options = {}) {
    const token = Auth.getToken();

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept':        'application/json',
    };

    // Add Bearer token if we have one
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {}),
        },
    };

    // For FormData (file uploads), remove Content-Type
    // so the browser sets it with the boundary automatically
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}/${endpoint}`;

    try {
        const response = await fetch(url, config);

        // Token expired or invalid → redirect to login
        if (response.status === 401) {
            Auth.clearToken();
            window.location.href = 'index.html';
            return null;
        }

        return response;
    } catch (err) {
        console.error('API fetch error:', err);
        throw err;
    }
}

// ── CONVENIENCE METHODS ──────────────────────────────────
const api = {
    get(endpoint, params = {}) {
        const qs = Object.keys(params).length
            ? '?' + new URLSearchParams(params).toString()
            : '';
        return apiFetch(endpoint + qs, { method: 'GET' });
    },

    post(endpoint, data = {}) {
        return apiFetch(endpoint, {
            method: 'POST',
            body:   data instanceof FormData ? data : JSON.stringify(data),
        });
    },

    put(endpoint, data = {}) {
        return apiFetch(endpoint, {
            method: 'PUT',
            body:   JSON.stringify(data),
        });
    },

    patch(endpoint, data = {}) {
        return apiFetch(endpoint, {
            method: 'PATCH',
            body:   JSON.stringify(data),
        });
    },

    delete(endpoint) {
        return apiFetch(endpoint, { method: 'DELETE' });
    },

    // File upload helper
    upload(endpoint, formData) {
        return apiFetch(endpoint, {
            method: 'POST',
            body:   formData,
        });
    },
};

// ── EXPORT HELPER ────────────────────────────────────────
// Used by employee_list.html to trigger file downloads from the API
function apiDownload(endpoint, params = {}) {
    const token = Auth.getToken();
    const qs    = new URLSearchParams({ ...params, token }).toString();
    // Open in new tab — Laravel streams the file
    window.open(`${API_BASE}/${endpoint}?${qs}`, '_blank');
}
