import axios from '../axios';

const userService = {
  getCurrentUser: async () => {
    const response = await axios.get('/users/me');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await axios.put('/users/profile', userData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  getSettings: async () => {
    const response = await axios.get('/users/settings');
    return response.data;
  },
  
  updateSettings: async (settings) => {
    const response = await axios.put('/users/settings', settings);
    return response.data;
  },
  
  changePassword: async (passwordData) => {
    const response = await axios.post('/users/change-password', passwordData);
    return response.data;
  }
};

export default userService;