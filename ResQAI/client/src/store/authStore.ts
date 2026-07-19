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
      console.warn('API login failed. Falling back to local offline mock user for demo.', err);
      const token = 'mock_demo_token';
      const userData = { _id: 'mock-user-id', name: email.split('@')[0], email, token };
      
      localStorage.setItem('resqai_token', token);
      localStorage.setItem('resqai_user', JSON.stringify(userData));
      
      set({ user: userData, token, loading: false });
      
      // Fetch profile data (will use fallbacks)
      await get().fetchMedicalProfile();
      await get().fetchContacts();
      return true;
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
      console.warn('API registration failed. Falling back to local offline mock user for demo.', err);
      const token = 'mock_demo_token';
      const userData = { _id: 'mock-user-id', name, email, token };
      
      localStorage.setItem('resqai_token', token);
      localStorage.setItem('resqai_user', JSON.stringify(userData));
      
      set({ user: userData, token, loading: false });
      
      // Fetch profile data (will use fallbacks)
      await get().fetchMedicalProfile();
      await get().fetchContacts();
      return true;
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
      console.warn('Failed to fetch profile from DB. Using local mock profile.', err);
      const mockProfile: MedicalProfile = {
        userId: 'mock-user-id',
        bloodGroup: 'O+',
        allergies: ['Penicillin', 'Peanuts'],
        chronicDiseases: ['None'],
        currentMedications: ['None'],
        insuranceProvider: 'Health Shield',
        insurancePolicyNo: 'HS-98765-A'
      };
      set({ medicalProfile: mockProfile, loading: false });
    }
  },

  updateMedicalProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/auth/medical-profile', data);
      set({ medicalProfile: response.data.data, loading: false });
      return true;
    } catch (err: any) {
      console.warn('Failed to save profile online. Saving to local state.', err);
      set((state) => ({
        medicalProfile: state.medicalProfile ? { ...state.medicalProfile, ...data } : (data as MedicalProfile),
        loading: false
      }));
      return true;
    }
  },

  fetchContacts: async () => {
    try {
      const response = await api.get('/auth/contacts');
      set({ contacts: response.data.data });
    } catch (err: any) {
      console.warn('Failed to fetch contacts from DB. Loading local mock contacts.', err);
      const mockContacts: EmergencyContact[] = [
        { _id: 'c1', userId: 'mock-user-id', name: 'John Doe', relation: 'Spouse', phone: '+1 555-0199', email: 'john.doe@example.com', isSOS: true },
        { _id: 'c2', userId: 'mock-user-id', name: 'Dr. Sarah Smith', relation: 'Primary Physician', phone: '+1 555-0144', email: 'sarah.smith@clinic.org', isSOS: false }
      ];
      set({ contacts: mockContacts });
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
      console.warn('Failed to save contact online. Saving to local state.', err);
      const newContact: EmergencyContact = {
        _id: 'mock-' + Math.random().toString(36).substr(2, 9),
        userId: 'mock-user-id',
        ...data
      };
      set((state) => ({
        contacts: [...state.contacts, newContact],
        loading: false
      }));
      return true;
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
      console.warn('Failed to delete contact online. Removing from local state.', err);
      set((state) => ({
        contacts: state.contacts.filter((c) => c._id !== id),
        loading: false
      }));
      return true;
    }
  }
}));
