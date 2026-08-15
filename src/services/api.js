const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Make API request with error handling
 */
const apiRequest = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The request timed out. Please try again.');
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
    });
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
