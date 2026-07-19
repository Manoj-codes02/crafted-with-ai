import { create } from 'zustand';
import api from '../services/api';
import { User, MedicalProfile, EmergencyContact } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  medicalProfile: MedicalProfile | null;
  contacts: EmergencyContact[];
  loading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchMedicalProfile: () => Promise<void>;
  updateMedicalProfile: (data: Partial<MedicalProfile>) => Promise<boolean>;
  fetchContacts: () => Promise<void>;
  addContact: (data: Omit<EmergencyContact, '_id' | 'userId'>) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: localStorage.getItem('resqai_user') ? JSON.parse(localStorage.getItem('resqai_user')!) : null,
  token: localStorage.getItem('resqai_token') || null,
  medicalProfile: null,
  contacts: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { name, token, _id } = response.data;
      const userData = { _id, name, email, token };
      
      localStorage.setItem('resqai_token', token);
      localStorage.setItem('resqai_user', JSON.stringify(userData));
      
      set({ user: userData, token, loading: false });
      
      // Fetch profile data
      await get().fetchMedicalProfile();
      await get().fetchContacts();
      
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, _id } = response.data;
      const userData = { _id, name, email, token };
      
      localStorage.setItem('resqai_token', token);
      localStorage.setItem('resqai_user', JSON.stringify(userData));
      
      set({ user: userData, token, loading: false });
      
      // Create profile data
      await get().fetchMedicalProfile();
      await get().fetchContacts();
      
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try again.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('resqai_token');
    localStorage.removeItem('resqai_user');
    set({ user: null, token: null, medicalProfile: null, contacts: [] });
  },

  fetchMedicalProfile: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/auth/medical-profile');
      set({ medicalProfile: response.data.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not fetch medical profile', loading: false });
    }
  },

  updateMedicalProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/auth/medical-profile', data);
      set({ medicalProfile: response.data.data, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update medical profile', loading: false });
      return false;
    }
  },

  fetchContacts: async () => {
    try {
      const response = await api.get('/auth/contacts');
      set({ contacts: response.data.data });
    } catch (err: any) {
      console.error('Failed to fetch emergency contacts', err);
    }
  },

  addContact: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/contacts', data);
      set((state) => ({
        contacts: [...state.contacts, response.data.data],
        loading: false
      }));
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to add contact', loading: false });
      return false;
    }
  },

  deleteContact: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/auth/contacts/${id}`);
      set((state) => ({
        contacts: state.contacts.filter((c) => c._id !== id),
        loading: false
      }));
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete contact', loading: false });
      return false;
    }
  }
}));
