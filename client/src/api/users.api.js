import api from './axios.js';

/** Admin: get paginated list of users */
export const getAllUsers = async (params = {}) => {
  const response = await api.get('/api/v1/users', { params });
  return response.data;
};

/** Admin: get a single user by ID */
export const getUserById = async (id) => {
  const response = await api.get(`/api/v1/users/${id}`);
  return response.data;
};

/** Admin: toggle a user's active/inactive status */
export const toggleUserStatus = async (id) => {
  const response = await api.patch(`/api/v1/users/${id}/status`);
  return response.data;
};

/** Student or Admin: update own profile */
export const updateProfile = async (data) => {
  const response = await api.put('/api/v1/users/profile', data);
  return response.data;
};

/** Student or Admin: change own password */
export const changePassword = async (data) => {
  const response = await api.post('/api/v1/users/change-password', data);
  return response.data;
};

/** Student: get own event stats (registered, attended, certificates) */
export const getMyStats = async () => {
  const response = await api.get('/api/v1/users/my-stats');
  return response.data;
};
