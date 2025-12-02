import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://debillpay-backend.onrender.com';
// const BASE_URL = 'http://192.168.3.51:5141';

export const apiClient = {
  async get(url: string) {
    return this.request(url, 'GET');
  },

  async post(url: string, data?: any) {
    return this.request(url, 'POST', data);
  },

  async put(url: string, data?: any) {
    return this.request(url, 'PUT', data);
  },

  async patch(url: string, data?: any) {
    return this.request(url, 'PATCH', data);
  },

  async delete(url: string) {
    return this.request(url, 'DELETE');
  },

  async request(url: string, method: string, data?: any) {
    const token = await AsyncStorage.getItem('userToken');
    
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${url}`, config);
    
 if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    } catch {
    }
    
    throw new Error(errorMessage);
  }

    return response.json();
  },
};