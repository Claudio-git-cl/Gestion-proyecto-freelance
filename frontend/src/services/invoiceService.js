import apiService from './apiService';

const BASE_URL = '/invoices';

const invoiceService = {
  /**
   * Get all invoices with optional filtering
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - API response
   */
  getInvoices: (filters = {}) => {
    return apiService.get(BASE_URL, filters)
      .then(response => response.data);
  },
  
  /**
   * Get invoice by ID
   * @param {string|number} id - Invoice ID
   * @returns {Promise} - API response
   */
  getInvoiceById: (id) => {
    return apiService.get(`${BASE_URL}/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Create new invoice
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise} - API response
   */
  createInvoice: (invoiceData) => {
    return apiService.post(BASE_URL, invoiceData)
      .then(response => response.data);
  },
  
  /**
   * Update existing invoice
   * @param {string|number} id - Invoice ID
   * @param {Object} invoiceData - Updated invoice data
   * @returns {Promise} - API response
   */
  updateInvoice: (id, invoiceData) => {
    return apiService.put(`${BASE_URL}/${id}`, invoiceData)
      .then(response => response.data);
  },
  
  /**
   * Delete invoice
   * @param {string|number} id - Invoice ID
   * @returns {Promise} - API response
   */
  deleteInvoice: (id) => {
    return apiService.delete(`${BASE_URL}/${id}`)
      .then(response => response.data);
  },
  
  /**
   * Mark invoice as paid
   * @param {string|number} id - Invoice ID
   * @param {Object} paymentData - Payment details
   * @returns {Promise} - API response
   */
  markAsPaid: (id, paymentData = {}) => {
    return apiService.post(`${BASE_URL}/${id}/pay`, paymentData)
      .then(response => response.data);
  },
  
  /**
   * Send invoice by email
   * @param {string|number} id - Invoice ID
   * @param {Object} emailData - Email details
   * @returns {Promise} - API response
   */
  sendInvoiceByEmail: (id, emailData) => {
    return apiService.post(`${BASE_URL}/${id}/send`, emailData)
      .then(response => response.data);
  },
  
  /**
   * Generate invoice PDF
   * @param {string|number} id - Invoice ID
   * @returns {Promise} - API response
   */
  generateInvoicePdf: (id) => {
    return apiService.download(`${BASE_URL}/${id}/pdf`, {}, `invoice-${id}.pdf`)
      .then(response => response.data);
  },
  
  /**
   * Get invoice statistics
   * @param {Object} params - Filter parameters
   * @returns {Promise} - API response
   */
  getInvoiceStats: (params = {}) => {
    return apiService.get(`${BASE_URL}/stats`, params)
      .then(response => response.data);
  },
  
  /**
   * Generate invoice from time entries
   * @param {Object} data - Generation parameters
   * @returns {Promise} - API response
   */
  generateFromTimeEntries: (data) => {
    return apiService.post(`${BASE_URL}/generate-from-time`, data)
      .then(response => response.data);
  }
};

export default invoiceService;