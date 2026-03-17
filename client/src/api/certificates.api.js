import api from './axios.js';

/** Admin: issue a certificate for an ATTENDED registration */
export const issueCertificate = async (registrationId) => {
  const response = await api.post(`/api/v1/certificates/issue/${registrationId}`);
  return response.data;
};

/** Admin: get all issued certificates with pagination/search */
export const getAdminCertificates = async (params = {}) => {
  const response = await api.get('/api/v1/certificates/admin', { params });
  return response.data;
};

/** Student: get own certificates */
export const getMyCertificates = async () => {
  const response = await api.get('/api/v1/certificates/my');
  return response.data;
};

/**
 * Student: download a certificate as a PDF blob.
 * Returns a Blob object — caller creates an object URL and triggers download.
 */
export const downloadCertificate = async (id) => {
  const response = await api.get(`/api/v1/certificates/${id}/download`, {
    responseType: 'blob',
  });
  return response.data; // Blob
};
