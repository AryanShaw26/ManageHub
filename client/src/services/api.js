const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      // Required for CSRF protection — signals this is an intentional XHR/fetch request
      'X-Requested-With': 'ManageHub',
      ...options.headers,
    };

    // Authentication is handled exclusively by the HttpOnly cookie set by the server.
    // No token is stored in localStorage — doing so would expose it to XSS attacks.

    const config = {
      ...options,
      headers,
      credentials: 'include', // send HttpOnly cookie on every request
    };

    let response;
    try {
      response = await fetch(url, config);
    } catch (networkErr) {
      throw new Error('Unable to connect to ManageHub server. Please check your network connection.');
    }

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.code = data?.error?.code;
      error.details = data?.error?.details || [];
      throw error;
    }

    return data;
  }

  get(endpoint, params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`${endpoint}${query}`, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
