import api from './axios.js';

/** Student: register for an event */
export const registerForEvent = async (data) => {
  const response = await api.post('/api/v1/registrations', data);
  return response.data;
};

/** Student: get own registrations with optional status filter */
export const getMyRegistrations = async (params = {}) => {
  const response = await api.get('/api/v1/registrations/my', { params });
  return response.data;
};

/** Student: cancel a PENDING or WAITLISTED registration */
export const cancelRegistration = async (id) => {
  const response = await api.delete(`/api/v1/registrations/${id}`);
  return response.data;
};

/** Student: submit feedback + rating for an attended event */
export const submitFeedback = async (id, data) => {
  const response = await api.post(`/api/v1/registrations/${id}/feedback`, data);
  return response.data;
};

/** Admin: get all registrations for a specific event */
export const getRegistrationsByEvent = async (eventId, params = {}) => {
  const response = await api.get(`/api/v1/registrations/event/${eventId}`, { params });
  return response.data;
};

/** Admin: update a registration's status */
export const updateRegistrationStatus = async (id, status) => {
  const response = await api.patch(`/api/v1/registrations/${id}/status`, { status });
  return response.data;
};

/** Admin: check in a student via their registration ID */
export const checkIn = async (id) => {
  const response = await api.post(`/api/v1/registrations/${id}/checkin`);
  return response.data;
};
