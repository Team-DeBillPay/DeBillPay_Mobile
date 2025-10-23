import { apiClient } from './apiClient';

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export const authApi = {
  login: (data: LoginData) => 
    apiClient.post('/api/auth/login', data),

  register: (data: RegisterData) => 
    apiClient.post('/api/auth/register', data),
};