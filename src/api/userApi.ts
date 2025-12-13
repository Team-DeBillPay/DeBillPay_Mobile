import { apiClient } from './apiClient';

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  token?: string;
};

export type CreateGroupDto = {
  name: string;
  friendIds: number[];
};

export type GroupMember = {
  memberId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export type Group = {
  groupId: number;
  name: string;
  members: GroupMember[];
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

  getGroups: () => apiClient.get('/api/groups'),

  getGroup: (groupId: number) => apiClient.get(`/api/groups/${groupId}`),

  createGroup: (data: CreateGroupDto) => 
    apiClient.post('/api/groups/create', data),

  deleteGroup: (groupId: number) => 
    apiClient.delete(`/api/groups/${groupId}/delete`),
};