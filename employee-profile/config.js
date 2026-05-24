// ============================================================
//  Rescue 1122 HRM — Frontend Configuration (IMPROVED)
//  This file connects the HTML frontend to the Laravel API.
//  
//  Features:
//  - Dynamic API URL detection
//  - Environment-based configuration
//  - Better error handling
//  - Token management with expiration
//  - Comprehensive logging
// ============================================================

// ── ENVIRONMENT DETECTION ───────────────────────────────
// Automatically detect if running locally or in production

const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('192.168');

const isProduction = window.location.protocol === 'https:';

// ── API BASE URL CONFIGURATION ──────────────────────────
// Automatically set based on environment

let API_BASE;
let PHOTO_BASE;

if (isDevelopment) {
    // Local development - explicit localhost URL
    API_BASE = 'http://127.0.0.1:8000/api';
    PHOTO_BASE = 'http://127.0.0.1:8000/storage/uploads/';
} else {
    // Production - use relative URL or your domain
    // This will work with any domain automatically
    API_BASE = '/api';
    PHOTO_BASE = '/storage/uploads/';
    
    // Uncomment below if you have a specific production domain
    // API_BASE = 'https://your-domain.com/api';
    // PHOTO_BASE = 'https://your-domain.com/storage/uploads/';
}

// Legacy aliases — kept for backward compatibility
const BASE = API_BASE;
const BASE_URL = API_BASE;

// ── CONFIGURATION OBJECT ───────────────────────────────
const AppConfig = {
    environment: isDevelopment ? 'development' : 'production',
    isDevelopment,
    isProduction,
    apiBase: API_BASE,
    photoBase: PHOTO_BASE,
    
    // API timeout in milliseconds
    apiTimeout: 30000,
    
    // Token settings
    tokenKey: 'hrm_token',
    userKey: 'hrm_user',
    tokenRefreshKey: 'hrm_refresh_token',
    
    // Session settings
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
    
    // Logging
    enableLogging: isDevelopment,
    logPrefix: '[HRM]',
};

// ── LOGGING UTILITY ────────────────────────────────────
const Logger = {
    log(message, data = null) {
        if (!AppConfig.enableLogging) return;
        console.log(`${AppConfig.logPrefix} ${message}`, data || '');
    },
    
    error(message, data = null) {
        console.error(`${AppConfig.logPrefix} ERROR: ${message}`, data || '');
    },
    
    warn(message, data = null) {
        console.warn(`${AppConfig.logPrefix} WARNING: ${message}`, data || '');
    },
    
    info(message, data = null) {
        console.info(`${AppConfig.logPrefix} INFO: ${message}`, data || '');
    },
};

// ── TOKEN MANAGEMENT ────────────────────────────────────
const Auth = {
    // Save token after login
    setToken(token, expiresIn = null) {
        localStorage.setItem(AppConfig.tokenKey, token);
        
        // Store expiration time if provided
        if (expiresIn) {
            const expiresAt = Date.now() + (expiresIn * 1000);
            localStorage.setItem(`${AppConfig.tokenKey}_expires`, expiresAt);
        }
        
        Logger.log('Token saved');
    },
    
    // Get saved token
    getToken() {
        const token = localStorage.getItem(AppConfig.tokenKey);
        
        // Check if token is expired
        if (token && this.isTokenExpired()) {
            Logger.warn('Token expired');
            this.clearToken();
            return null;
        }
        
        return token;
    },
    
    // Check if token is expired
    isTokenExpired() {
        const expiresAt = localStorage.getItem(`${AppConfig.tokenKey}_expires`);
        if (!expiresAt) return false;
        return Date.now() > parseInt(expiresAt);
    },
    
    // Get time until token expires (in seconds)
    getTokenExpiresIn() {
        const expiresAt = localStorage.getItem(`${AppConfig.tokenKey}_expires`);
        if (!expiresAt) return null;
        const remaining = parseInt(expiresAt) - Date.now();
        return remaining > 0 ? Math.floor(remaining / 1000) : 0;
    },
    
    // Remove token on logout
    clearToken() {
        localStorage.removeItem(AppConfig.tokenKey);
        localStorage.removeItem(`${AppConfig.tokenKey}_expires`);
        localStorage.removeItem(AppConfig.userKey);
        localStorage.removeItem(AppConfig.tokenRefreshKey);
        Logger.log('Token cleared');
    },
    
    // Save user info
    setUser(user) {
        localStorage.setItem(AppConfig.userKey, JSON.stringify(user));
        Logger.log('User info saved', user);
    },
    
    // Get user info
    getUser() {
        try {
            const user = localStorage.getItem(AppConfig.userKey);
            return user ? JSON.parse(user) : null;
        } catch (err) {
            Logger.error('Failed to parse user info', err);
            return null;
        }
    },
    
    // Check if logged in
    isLoggedIn() {
        return !!this.getToken();
    },
    
    // Redirect to login if not authenticated
    requireAuth(redirectUrl = 'index.html') {
        if (!this.isLoggedIn()) {
            Logger.warn('Authentication required, redirecting to login');
            window.location.href = redirectUrl;
        }
    },
    
    // Get authorization header
    getAuthHeader() {
        const token = this.getToken();
        if (!token) return {};
        return {
            'Authorization': `Bearer ${token}`
        };
    }
};

// ── FETCH WRAPPER ────────────────────────────────────────
// All API calls go through this — automatically adds
// Authorization header, handles timeouts, and manages errors

async function apiFetch(endpoint, options = {}) {
    const token = Auth.getToken();
    
    // Check if token is expired before making request
    if (token && Auth.isTokenExpired()) {
        Logger.warn('Token expired, clearing and redirecting to login');
        Auth.clearToken();
        window.location.href = 'index.html';
        return null;
    }
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    };
    
    // Add Bearer token if available
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
    
    // Construct full URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}/${endpoint}`;
    
    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AppConfig.apiTimeout);
    
    config.signal = controller.signal;
    
    try {
        Logger.log(`${config.method || 'GET'} ${url}`);
        
        const response = await fetch(url, config);
        clearTimeout(timeoutId);
        
        // Handle 401 Unauthorized - token invalid/expired
        if (response.status === 401) {
            Logger.error('Unauthorized - Token invalid or expired');
            Auth.clearToken();
            window.location.href = 'index.html';
            return null;
        }
        
        // Handle 403 Forbidden
        if (response.status === 403) {
            Logger.error('Forbidden - You do not have permission');
            throw new Error('You do not have permission to access this resource');
        }
        
        // Handle 404 Not Found
        if (response.status === 404) {
            Logger.error('Not Found - Resource does not exist');
            throw new Error('Resource not found');
        }
        
        // Handle 500+ Server errors
        if (response.status >= 500) {
            Logger.error(`Server error: ${response.status}`);
            throw new Error('Server error. Please try again later.');
        }
        
        // Log response status
        Logger.log(`Response: ${response.status} ${response.statusText}`);
        
        return response;
        
    } catch (err) {
        clearTimeout(timeoutId);
        
        // Handle different error types
        if (err.name === 'AbortError') {
            Logger.error('Request timeout', `${AppConfig.apiTimeout}ms exceeded`);
            throw new Error(`Request timed out after ${AppConfig.apiTimeout / 1000}s. Check your connection.`);
        }
        
        if (err instanceof TypeError) {
            Logger.error('Network error', err.message);
            throw new Error('Network error. Server may be unreachable.');
        }
        
        Logger.error('Fetch error', err);
        throw err;
    }
}

// ── CONVENIENCE METHODS ──────────────────────────────────
const api = {
    // GET request
    get(endpoint, params = {}) {
        const qs = Object.keys(params).length
            ? '?' + new URLSearchParams(params).toString()
            : '';
        return apiFetch(endpoint + qs, { method: 'GET' });
    },
    
    // POST request
    post(endpoint, data = {}) {
        return apiFetch(endpoint, {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
    },
    
    // PUT request
    put(endpoint, data = {}) {
        return apiFetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    
    // PATCH request
    patch(endpoint, data = {}) {
        return apiFetch(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },
    
    // DELETE request
    delete(endpoint) {
        return apiFetch(endpoint, { method: 'DELETE' });
    },
    
    // File upload helper
    upload(endpoint, formData) {
        return apiFetch(endpoint, {
            method: 'POST',
            body: formData,
        });
    },
};

// ── HELPER FUNCTIONS ────────────────────────────────────

// Export helper - used by employee_list.html for file downloads
function apiDownload(endpoint, params = {}) {
    const token = Auth.getToken();
    const qs = new URLSearchParams({ ...params, token }).toString();
    const downloadUrl = `${API_BASE}/${endpoint}?${qs}`;
    Logger.log('Download initiated', downloadUrl);
    window.open(downloadUrl, '_blank');
}

// Parse API response with error handling
async function parseApiResponse(response) {
    try {
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
            Logger.warn('Response is not JSON');
            return { success: false, error: 'Invalid response format' };
        }
        
        const data = await response.json();
        Logger.log('Response parsed', data);
        return data;
        
    } catch (err) {
        Logger.error('Failed to parse response', err);
        return { success: false, error: 'Failed to parse server response' };
    }
}

// ── INITIALIZATION ──────────────────────────────────────

// Log configuration on page load (development only)
if (AppConfig.enableLogging) {
    console.group('%cHRM Configuration', 'color: #1976d2; font-weight: bold;');
    console.log('Environment:', AppConfig.environment);
    console.log('API Base:', AppConfig.apiBase);
    console.log('Photo Base:', AppConfig.photoBase);
    console.log('Logged In:', Auth.isLoggedIn());
    if (Auth.isLoggedIn()) {
        console.log('User:', Auth.getUser());
        console.log('Token expires in:', Auth.getTokenExpiresIn(), 'seconds');
    }
    console.groupEnd();
}

// ============================================================
//  EXPORTS
// ============================================================
// These are available globally in browser:
// - Auth (authentication helper)
// - api (API methods)
// - AppConfig (configuration object)
// - Logger (logging utility)
// - apiFetch (main fetch wrapper)
// - apiDownload (file download helper)
// - parseApiResponse (response parser)
