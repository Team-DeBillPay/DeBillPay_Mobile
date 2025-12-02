import { apiClient } from './apiClient';

export const ebillApi = {
  createEbill: (data: any) => apiClient.post('/api/ebills/create', data),
  getEbills: () => apiClient.get('/api/ebills'),
  getEbillById: (id: number) => apiClient.get(`/api/ebills/${id}`),

  addParticipants: (ebillId: number, userIds: number[]) =>
    apiClient.post(`/api/ebills/${ebillId}/participants/add`, { userIds }),

  updateEbillParticipants: (ebillId: number, dto: any) =>
    apiClient.put(`/api/ebills/${ebillId}/participants/update`, dto),

  removeParticipant: (ebillId: number, participantId: number) =>
    apiClient.delete(`/api/ebills/${ebillId}/participants/${participantId}/remove`),

  getEbillHistory: (ebillId: number) => apiClient.get(`/api/ebills/${ebillId}/history`),
};
