import { apiClient } from './apiClient';

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  token?: string;
};

export const userApi = {
  getUsers: () => apiClient.get('/api/users'),
  
  getUser: (id: number) => apiClient.get(`/api/users/${id}`),
  
  updateUser: (id: number, data: UpdateUserData) => 
    apiClient.patch(`/api/users/${id}`, data),
};