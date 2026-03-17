import api from './axios.js';

/**
 * Get paginated list of events.
 * @param {Object} params - { page, limit, category, status, search, startDate, endDate }
 */
export const getEvents = async (params = {}) => {
  const response = await api.get('/api/v1/events', { params });
  return response.data;
};

/**
 * Get a single event by ID.
 * Also returns myRegistration if the calling user is an authenticated student.
 * @param {string} id
 */
export const getEventById = async (id) => {
  const response = await api.get(`/api/v1/events/${id}`);
  return response.data;
};

/**
 * Create a new event (admin only).
 * @param {Object} data - event fields
 */
export const createEvent = async (data) => {
  const response = await api.post('/api/v1/events', data);
  return response.data;
};

/**
 * Update an existing event (admin only).
 * @param {string} id
 * @param {Object} data - partial event fields
 */
export const updateEvent = async (id, data) => {
  const response = await api.put(`/api/v1/events/${id}`, data);
  return response.data;
};

/**
 * Delete an event (admin only).
 * @param {string} id
 */
export const deleteEvent = async (id) => {
  const response = await api.delete(`/api/v1/events/${id}`);
  return response.data;
};

/**
 * Update the status of an event (admin only).
 * @param {string} id
 * @param {string} status - DRAFT | PUBLISHED | ONGOING | COMPLETED | CANCELLED
 */
export const updateEventStatus = async (id, status) => {
  const response = await api.patch(`/api/v1/events/${id}/status`, { status });
  return response.data;
};
