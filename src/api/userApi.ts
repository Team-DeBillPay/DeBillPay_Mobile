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

  getContacts: () => apiClient.get('/api/contacts'),

  searchNewContact: (query: string) =>
    apiClient.get(`/api/users/searchNewContact?query=${encodeURIComponent(query)}`),

  inviteUser: (receiverId: number) =>
    apiClient.post(`/api/contacts/invite?receiverId=${receiverId}`),

  getInvitations: () => apiClient.get('/api/users/invitationsContacts'),

  acceptInvite: (id: number) =>
    apiClient.post(`/api/contacts/accept?invitationId=${id}`),

  rejectInvite: (id: number) =>
    apiClient.post(`/api/contacts/reject?invitationId=${id}`),

  deleteFriend: (id: number) =>
    apiClient.delete(`/api/contacts/delete?friendId=${id}`),
};