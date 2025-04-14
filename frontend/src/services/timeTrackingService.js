import apiService from './apiService';

const BASE_URL = '/time-tracking';

const timeTrackingService = {
  /**
   * Get time entries with optional filtering
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - API response
   */
  getTimeEntries: (filters = {}) => {
    return apiService.get(BASE_URL, filters)
      .then(response => response.data);
  },
  
  /**
   * Get time entry by ID
   * @param {string|number} id - Time entry ID
   * @returns {Promise} - API response
   */
  getTimeEntryById: (id) => {
    return apiService.get(`${BASE_URL}/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Create new time entry
   * @param {Object} entryData - Time entry data
   * @returns {Promise} - API response
   */
  createTimeEntry: (entryData) => {
    return apiService.post(BASE_URL, entryData)
      .then(response => response.data);
  },
  
  /**
   * Update existing time entry
   * @param {string|number} id - Time entry ID
   * @param {Object} entryData - Updated time entry data
   * @returns {Promise} - API response
   */
  updateTimeEntry: (id, entryData) => {
    return apiService.put(`${BASE_URL}/${id}`, entryData)
      .then(response => response.data);
  },
  
  /**
   * Delete time entry
   * @param {string|number} id - Time entry ID
   * @returns {Promise} - API response
   */
  deleteTimeEntry: (id) => {
    return apiService.delete(`${BASE_URL}/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Start time tracking
   * @param {string|number} projectId - Project ID
   * @param {Object} data - Additional data
   * @returns {Promise} - API response
   */
  startTracking: (projectId, data = {}) => {
    return apiService.post(`${BASE_URL}/start`, { projectId, ...data })
      .then(response => response.data);
  },
  
  /**
   * Stop time tracking
   * @param {string|number} trackingId - Tracking session ID
   * @param {Object} data - Additional data
   * @returns {Promise} - API response
   */
  stopTracking: (trackingId, data = {}) => {
    return apiService.post(`${BASE_URL}/${trackingId}/stop`, data)
      .then(response => response.data);
  },
  
  /**
   * Get time tracking summary
   * @param {Object} params - Filter parameters
   * @returns {Promise} - API response
   */
  getTimeSummary: (params = {}) => {
    return apiService.get(`${BASE_URL}/summary`, params)
      .then(response => response.data);
  },
  
  /**
   * Export time tracking report
   * @param {Object} filters - Filter parameters
   * @param {string} format - Export format (pdf, csv, xlsx)
   * @returns {Promise} - API response
   */
  exportTimeReport: (filters = {}, format = 'xlsx') => {
    return apiService.download(`${BASE_URL}/export`, { ...filters, format }, `time-report.${format}`)
      .then(response => response.data);
  }
};

export default timeTrackingService;