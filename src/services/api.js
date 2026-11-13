const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getFallbackErrorMessage = (status) => {
  if (status === 400) return 'Some submitted information is invalid. Check the form and try again.';
  if (status === 401) return 'Your admin session has expired. Sign in again to continue.';
  if (status === 403) return 'You are not allowed to perform this action.';
  if (status === 404) return 'The requested information could not be found.';
  if (status === 413) return 'The submitted file or data is too large.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'The server is temporarily unavailable. Please try again later.';
  return `The request failed (HTTP ${status}). Please try again.`;
};

/**
 * Make API request with error handling
 */
const apiRequest = async (endpoint, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(typeof FormData !== 'undefined' && options.body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      signal: controller.signal,
    });

    let data = {};
    try {
      const responseData = await response.json();
      data = responseData && typeof responseData === 'object' ? responseData : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      const fieldErrors = Array.isArray(data.errors)
        ? data.errors.map((error) => `${error.field || error.path || 'Form'}: ${error.message || error.msg}`).join(' ')
        : '';
      throw new Error(fieldErrors || data.message || getFallbackErrorMessage(response.status));
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The request timed out. Please try again.');
    }
    if (error instanceof TypeError) {
      throw new Error('Could not connect to the portfolio server. Check your connection and try again.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};

/**
 * Projects API
 */
export const projectsAPI = {
  /**
   * Get all projects
   */
  getAll: async () => {
    const result = await apiRequest('/projects');
    return result.data || [];
  },

  /**
   * Get single project by ID
   */
  getById: async (id) => {
    const result = await apiRequest(`/projects/${id}`);
    return result.data;
  },

  /**
   * Create a project using the authenticated admin session
   */
  create: async (project, token) => {
    const formData = new FormData();
    formData.append('title', project.title);
    formData.append('description', project.description);
    formData.append('liveLink', project.liveLink);
    formData.append('banner', project.banner);
    const result = await apiRequest('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }, 60000);
    return result.data;
  },
};

/**
 * Contact API
 */
export const contactAPI = {
  /**
   * Submit contact form
   */
  submit: async (formData) => {
    const result = await apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    }, 30000);
    return result;
  },
};

/**
 * Health check
 */
export const health = {
  check: async () => {
    try {
      const result = await apiRequest('/health');
      return result.data?.status === 'ok';
    } catch {
      return false;
    }
  },
};
