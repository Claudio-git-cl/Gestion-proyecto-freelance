import apiService from './apiService';

const BASE_URL = '/projects';

const projectService = {
  /**
   * Get all projects with optional filtering
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - API response
   */
  getProjects: (filters = {}) => {
    return apiService.get(BASE_URL, filters)
      .then(response => response.data);
  },
  
  /**
   * Get project by ID
   * @param {string|number} id - Project ID
   * @returns {Promise} - API response
   */
  getProjectById: (id) => {
    return apiService.get(`${BASE_URL}/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Create new project
   * @param {Object} projectData - Project data
   * @returns {Promise} - API response
   */
  createProject: (projectData) => {
    return apiService.post(BASE_URL, projectData)
      .then(response => response.data);
  },
  
  /**
   * Update existing project
   * @param {string|number} id - Project ID
   * @param {Object} projectData - Updated project data
   * @returns {Promise} - API response
   */
  updateProject: (id, projectData) => {
    return apiService.put(`${BASE_URL}/${id}`, projectData)
      .then(response => response.data);
  },
  
  /**
   * Delete project
   * @param {string|number} id - Project ID
   * @returns {Promise} - API response
   */
  deleteProject: (id) => {
    return apiService.delete(`${BASE_URL}/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Get project tasks
   * @param {string|number} projectId - Project ID
   * @returns {Promise} - API response
   */
  getProjectTasks: (projectId) => {
    return apiService.get(`${BASE_URL}/${projectId}/tasks`)
      .then(response => response.data);
  },
  
  /**
   * Add task to project
   * @param {string|number} projectId - Project ID
   * @param {Object} taskData - Task data
   * @returns {Promise} - API response
   */
  addProjectTask: (projectId, taskData) => {
    return apiService.post(`${BASE_URL}/${projectId}/tasks`, taskData)
      .then(response => response.data);
  },
  
  /**
   * Update project task
   * @param {string|number} projectId - Project ID
   * @param {string|number} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise} - API response
   */
  updateProjectTask: (projectId, taskId, taskData) => {
    return apiService.put(`${BASE_URL}/${projectId}/tasks/${taskId}`, taskData)
      .then(response => response.data);
  },
  
  /**
   * Delete project task
   * @param {string|number} projectId - Project ID
   * @param {string|number} taskId - Task ID
   * @returns {Promise} - API response
   */
  deleteProjectTask: (projectId, taskId) => {
    return apiService.delete(`${BASE_URL}/${projectId}/tasks/${taskId}`)
      .then(response => response.data);
  },
  
  /**
   * Upload project files
   * @param {string|number} projectId - Project ID
   * @param {FormData} formData - Form data with files
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - API response
   */
  uploadProjectFiles: (projectId, formData, onProgress = null) => {
    return apiService.upload(`${BASE_URL}/${projectId}/files`, formData, onProgress)
      .then(response => response.data);
  },
  
  /**
   * Get project files
   * @param {string|number} projectId - Project ID
   * @returns {Promise} - API response
   */
  getProjectFiles: (projectId) => {
    return apiService.get(`${BASE_URL}/${projectId}/files`)
      .then(response => response.data);
  },
  
  /**
   * Delete project file
   * @param {string|number} projectId - Project ID
   * @param {string|number} fileId - File ID
   * @returns {Promise} - API response
   */
  deleteProjectFile: (projectId, fileId) => {
    return apiService.delete(`${BASE_URL}/${projectId}/files/${fileId}`)
      .then(response => response.data);
  }
};

export default projectService;