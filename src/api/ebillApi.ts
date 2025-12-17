import { apiClient } from './apiClient';


export type EditorRightsDto = {
  participantId: number;
  isEditorRights: boolean;
};

export type UpdateEditorRightsDto = {
  participants: EditorRightsDto[];
};

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

  getComments: (ebillId: number) => 
    apiClient.get(`/api/ebills/${ebillId}/comments`),

  createComment: (commentDto: { ebillId: number; text: string }) =>
    apiClient.post(`/api/ebills/${commentDto.ebillId}/comments/create`, commentDto),

  updateEditorRights: (ebillId: number, participants: EditorRightsDto[]) =>
    apiClient.put(`/api/ebills/${ebillId}/editor-rights`, { participants }),
  
  deleteEbill: (ebillId: number) =>
    apiClient.delete(`/api/ebills/delete${ebillId}`),
};
