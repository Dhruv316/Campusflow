import api from './axios.js';

/** Admin: send an announcement to all students or a specific event's attendees */
export const sendAnnouncement = async (data) => {
  const response = await api.post('/api/v1/notifications/announce', data);
  return response.data;
};

/** Admin: get notifications for the admin user */
export const getAdminNotifications = async (params = {}) => {
  const response = await api.get('/api/v1/notifications/admin', { params });
  return response.data;
};

/**
 * Student or Admin: get own notifications.
 * @param {Object} params - { page, limit, unreadOnly }
 * Returns { notifications, unreadCount, pagination }
 */
export const getMyNotifications = async (params = {}) => {
  const response = await api.get('/api/v1/notifications/my', { params });
  return response.data;
};

/** Mark a single notification as read */
export const markRead = async (id) => {
  const response = await api.patch(`/api/v1/notifications/${id}/read`);
  return response.data;
};

/** Mark all of the current user's notifications as read */
export const markAllRead = async () => {
  const response = await api.patch('/api/v1/notifications/read-all');
  return response.data;
};
