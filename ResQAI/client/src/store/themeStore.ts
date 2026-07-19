import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  largeText: boolean;
  highContrast: boolean;
  language: 'en' | 'hi' | 'gu';
  
  toggleTheme: () => void;
  toggleLargeText: () => void;
  toggleHighContrast: () => void;
  setLanguage: (lang: 'en' | 'hi' | 'gu') => void;
  initSettings: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('resqai_theme') as 'light' | 'dark') || 'light',
  largeText: localStorage.getItem('resqai_large_text') === 'true',
  highContrast: localStorage.getItem('resqai_high_contrast') === 'true',
  language: (localStorage.getItem('resqai_language') as 'en' | 'hi' | 'gu') || 'en',

  initSettings: () => {
    const theme = (localStorage.getItem('resqai_theme') as 'light' | 'dark') || 'light';
    const largeText = localStorage.getItem('resqai_large_text') === 'true';
    const highContrast = localStorage.getItem('resqai_high_contrast') === 'true';
    
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    const body = window.document.body;
    if (largeText) {
      body.classList.add('text-lg');
    } else {
      body.classList.remove('text-lg');
    }
    
    if (highContrast) {
      body.classList.add('contrast-125');
    } else {
      body.classList.remove('contrast-125');
    }
  },

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('resqai_theme', newTheme);
    
    const root = window.document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    return { theme: newTheme };
  }),

  toggleLargeText: () => set((state) => {
    const newVal = !state.largeText;
    localStorage.setItem('resqai_large_text', String(newVal));
    
    const body = window.document.body;
    if (newVal) {
      body.classList.add('text-lg');
    } else {
      body.classList.remove('text-lg');
    }
    
    return { largeText: newVal };
  }),

  toggleHighContrast: () => set((state) => {
    const newVal = !state.highContrast;
    localStorage.setItem('resqai_high_contrast', String(newVal));
    
    const body = window.document.body;
    if (newVal) {
      body.classList.add('contrast-125');
    } else {
      body.classList.remove('contrast-125');
    }
    
    return { highContrast: newVal };
  }),

  setLanguage: (lang) => set(() => {
    localStorage.setItem('resqai_language', lang);
    return { language: lang };
  })
}));
export default useThemeStore;
