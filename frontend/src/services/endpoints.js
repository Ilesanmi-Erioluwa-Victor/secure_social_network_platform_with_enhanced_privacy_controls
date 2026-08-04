import api from './api';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  verifyMFA: (data) => api.post('/auth/mfa/verify', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const usersAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  searchUsers: (q) => api.get('/users/search', { params: { q } }),
  updateProfile: (data) => api.patch('/users/me', data),
  updatePrivacySettings: (data) => api.patch('/users/me/privacy-settings', data),
  blockUser: (id) => api.post(`/users/${id}/block`),
  unblockUser: (id) => api.post(`/users/${id}/unblock`),
  getBlockedUsers: () => api.get('/users/me/blocks'),
  deleteAccount: () => api.delete('/users/me'),
  downloadData: () => api.get('/users/me/data'),
};

export const postsAPI = {
  getFeed: (params) => api.get('/posts/feed', { params }),
  getUserPosts: (userId, params) => api.get(`/posts/user/${userId}`, { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updateVisibility: (id, data) => api.patch(`/posts/${id}/visibility`, data),
  likePost: (id) => api.post(`/posts/${id}/like`),
  addComment: (id, data) => api.post(`/posts/${id}/comments`, data),
  getComments: (id, params) => api.get(`/posts/${id}/comments`, { params }),
};

export const friendsAPI = {
  getFriends: () => api.get('/friends'),
  getRequests: () => api.get('/friends/requests'),
  sendRequest: (id) => api.post(`/friends/request/${id}`),
  respondToRequest: (id, data) => api.patch(`/friends/${id}/respond`, data),
  unfriend: (id) => api.delete(`/friends/${id}`),
};

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  sendMessage: (userId, data) => api.post(`/messages/${userId}`, data),
  getMessages: (userId, params) => api.get(`/messages/${userId}`, { params }),
  getUnreadCount: () => api.get('/messages/unread/count'),
};

export const reportsAPI = {
  createReport: (data) => api.post('/reports', data),
};

export const adminAPI = {
  getReports: (params) => api.get('/admin/reports', { params }),
  reviewReport: (id, data) => api.patch(`/admin/reports/${id}/review`, data),
  suspendUser: (id) => api.patch(`/admin/users/${id}/suspend`),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getStats: () => api.get('/admin/stats'),
  seedDatabase: () => api.post('/seed'),
};

export const uploadAPI = {
  uploadFile: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
