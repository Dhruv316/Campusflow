import api from './axios.js';

/** Get dashboard overview stats */
export const getOverview = async () => {
  const response = await api.get('/api/v1/analytics/overview');
  return response.data;
};

/** Get per-event analytics breakdown */
export const getEventAnalytics = async () => {
  const response = await api.get('/api/v1/analytics/events');
  return response.data;
};

/** Get registration trend data for the last 30 days */
export const getRegistrationTrends = async () => {
  const response = await api.get('/api/v1/analytics/trends');
  return response.data;
};
