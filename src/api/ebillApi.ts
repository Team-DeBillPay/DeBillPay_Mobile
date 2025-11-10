import { apiClient } from './apiClient';

export const ebillApi = {
  createEbill: (data: any) => apiClient.post('/api/ebills/create', data),
  getEbills: () => apiClient.get('/api/ebills'),
  getEbillById: (id: number) => apiClient.get(`/api/ebills/${id}`)
};
