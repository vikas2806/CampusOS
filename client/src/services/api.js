import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // If unauthorized and not already on login/register, clear token
      const isAuthRoute = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
      if (!isAuthRoute) {
        localStorage.removeItem('campusos_token');
        localStorage.removeItem('campusos_user');
      }
    }
    return Promise.reject(error);
  }
);

// API Service modules
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const clubService = {
  getMyClub: () => api.get('/clubs/mine'),
  createClub: (data) => api.post('/clubs', data),
  updateClub: (id, data) => api.patch(`/clubs/${id}`, data),
  getPlans: () => api.get('/clubs/plans'),
  createOrder: (id, data) => api.post(`/clubs/${id}/create-order`, data),
  upgradePlan: (id, data) => api.post(`/clubs/${id}/upgrade`, data),
};

export const eventService = {
  list: (params) => api.get('/events', { params }),
  get: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  listTemplates: (params) => api.get('/events/templates', { params }),
  createTemplate: (data) => api.post('/events/templates', data),
  saveAsTemplate: (id, data) => api.post(`/events/${id}/template`, data),
  instantiateTemplate: (templateId, data) =>
    api.post(`/events/templates/${templateId}/instantiate`, data),
  deleteTemplate: (id) => api.delete(`/events/templates/${id}`),
};

export const registrationService = {
  list: (params) => api.get('/registrations', { params }),
  get: (id) => api.get(`/registrations/${id}`),
  exportCsv: (params) =>
    api.get('/registrations/export/csv', { params, responseType: 'blob' }),
};

export const checkinService = {
  verifyQr: (token) => api.post('/checkin/scan', { token }),
  manualCheckin: (registrationId) => api.post('/checkin/manual', { registrationId }),
  getLive: (eventId) => api.get(`/checkin/live/${eventId}`),
};

export const certificateService = {
  getTemplate: (eventId) => api.get(`/certificates/templates/${eventId}`),
  saveTemplate: (data) => api.post('/certificates/templates', data),
  issueForEvent: (eventId, data) => api.post(`/certificates/events/${eventId}/issue`, data),
  downloadPdf: (registrationId) =>
    api.get(`/certificates/${registrationId}/download`, { responseType: 'blob' }),
  verify: (code) => api.get(`/certificates/verify/${code}`),
  downloadVerifiedPdf: (code) =>
    api.get(`/certificates/verify/${code}/pdf`, { responseType: 'blob' }),
};

export const taskService = {
  list: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const budgetService = {
  get: (eventId) => api.get(`/budget/${eventId}`),
  upsert: (data) => api.post('/budget', data),
  addExpense: (eventId, data) => api.post(`/budget/${eventId}/expenses`, data),
  deleteExpense: (eventId, expenseId) => api.delete(`/budget/${eventId}/expenses/${expenseId}`),
  addIncome: (eventId, data) => api.post(`/budget/${eventId}/income`, data),
  exportCsv: (eventId) =>
    api.get(`/reports/events/${eventId}/budget/csv`, { responseType: 'blob' }),
};

export const announcementService = {
  list: (params) => api.get('/announcements', { params }),
  send: (data) => api.post('/announcements', data),
};

export const reportService = {
  getEventReport: (eventId) => api.get(`/reports/events/${eventId}`),
  getClubReport: (clubId) => api.get(`/reports/clubs/${clubId}`),
};

export const dashboardService = {
  getStats: (params) => api.get('/dashboard/stats', { params }),
};

export const publicService = {
  getEvents: (params) => api.get('/public/events', { params }),
  getEventBySlug: (slug) => api.get(`/public/events/${slug}`),
  register: (data) => api.post('/public/register', data),
  verifyCertificate: (code) => api.get(`/public/certificates/verify/${code}`),
};

export const contactService = {
  submit: (data) => api.post('/contact', data),
};

export default api;
