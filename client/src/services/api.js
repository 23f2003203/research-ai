const rawApiUrl = import.meta.env.VITE_API_URL;
export const BASE_URL = rawApiUrl
  ? rawApiUrl.endsWith('/api')
    ? rawApiUrl
    : `${rawApiUrl.replace(/\/+$/, '')}/api`
  : '/api';

let authToken = typeof window !== 'undefined' ? localStorage.getItem('research_ai_token') : null;

export const setAuthToken = (token) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('research_ai_token', token);
    } else {
      localStorage.removeItem('research_ai_token');
    }
  }
};

export const getAuthToken = () => authToken;

async function request(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Automatically send and receive HTTP-only cookies
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: async (body) => {
    const data = await request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    if (data.token) setAuthToken(data.token);
    return data;
  },
  login: async (body) => {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    if (data.token) setAuthToken(data.token);
    return data;
  },
  logout: async () => {
    try {
      return await request('/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },
  getMe: () => request('/auth/me', { method: 'GET' }),

  // Research
  listResearch: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'undefined' && v !== 'null'
      )
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/research${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  createResearch: (body) => request('/research', { method: 'POST', body: JSON.stringify(body) }),
  getResearch: (id) => request(`/research/${id}`, { method: 'GET' }),
  startResearch: (id) => request(`/research/${id}/start`, { method: 'POST' }),
  cancelResearch: (id) => request(`/research/${id}/cancel`, { method: 'POST' }),
  getSources: (id) => request(`/research/${id}/sources`, { method: 'GET' }),
  getClaims: (id) => request(`/research/${id}/claims`, { method: 'GET' }),
  getReport: (id) => request(`/research/${id}/report`, { method: 'GET' }),
  refineResearch: (id, body) => request(`/research/${id}/refine`, { method: 'POST', body: JSON.stringify(body) }),
  deleteResearch: (id) => request(`/research/${id}`, { method: 'DELETE' }),

  // Export URL helper
  getExportUrl: (id, format = 'markdown') => `${BASE_URL}/research/${id}/export?format=${format}`,
};
