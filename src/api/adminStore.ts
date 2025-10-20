import { create } from 'zustand';

export interface AdminState {
  token: string | null;
  admin: any; // or your admin type
  setToken: (token: string) => void;
  setAdmin: (admin: any) => void;
  clearAuth: () => void; // Add this
}

export const useAdminStore = create<AdminState>((set) => ({
  token: localStorage.getItem("adminToken") || null,
  admin: null,
  setToken: (token) => {
    localStorage.setItem("adminToken", token);
    set({ token });
  },
  setAdmin: (admin) => set({ admin }),
  clearAuth: () => {
    localStorage.removeItem("adminToken");
    set({ token: null, admin: null });
  },
}));