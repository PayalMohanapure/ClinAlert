import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      doctor: null,
      token: null,
      analysisResult: null,
      
      login: (doctorData, token) => set({ isAuthenticated: true, doctor: doctorData, token: token }),
      logout: () => set({ isAuthenticated: false, doctor: null, token: null, analysisResult: null }),
      setAnalysisResult: (data) => set({ analysisResult: data }),
    }),
    {
      name: 'clinalert-storage', // unique name for localStorage key
    }
  )
);
